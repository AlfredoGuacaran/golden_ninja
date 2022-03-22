const express = require('express');
const nunjucks = require('nunjucks');
const app = express();
const session = require('express-session');
const crypto = require('crypto');

// const { getCursos, nuevoCurso, borrarCurso, editarCurso } = require('./db');

const bodyParser = require('body-parser');
const { render, get } = require('express/lib/response');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(express.static('static'));
app.use(express.static('node_modules/bootstrap/dist'));
nunjucks.configure('views', {
  express: app,
  autoescape: true,
  noCache: false,
  watch: true,
});

app.use(
  session({
    secret: 'mi-clave',
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 },
    resave: false,
  })
);

app.get('/', (req, res) => {
  console.log('ejercicios en sesion', req.session.ejercicios);
  return res.json(req.session);
});

app.get('/add/:nuevo', (req, res) => {
  if (!req.session.ejercicios) {
    req.session.ejercicios = [];
  }

  const nuevoEjercicio = req.params.nuevo;
  console.log(req.session.ejercicios);
  req.session.ejercicios.push(nuevoEjercicio);
  res.redirect('/');
});

app.get('/reset', (req, res) => {
  req.session.ejercicios = [];
  res.redirect('/');
});

////////////////// RAMDOM WORD

app.get('/random', (req, res) => {
  const random_word = crypto.randomBytes(7).toString('hex');
  if (!req.session.contador) {
    req.session.contador = 0;
  }
  req.session.contador++;
  const contador = req.session.contador;
  res.render('index.html', { random_word, contador });
});

app.get('/random/reset', (req, res) => {
  req.session.contador = 0;
  res.redirect('/random');
});

////////////////////////////////////////////// ninja gold

const findGold = place => {
  let min, max;
  if (place == 'farm') {
    min = 10;
    max = 20;
  }

  if (place == 'cave') {
    min = 5;
    max = 10;
  }

  if (place == 'house') {
    min = 2;
    max = 5;
  }

  if (place == 'casino') {
    min = -50;
    max = 50;
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getDate = () => {
  const today = new Date();
  const date = `${today.getDate()}/${
    today.getMonth() + 1 < 10
      ? '0' + (today.getMonth() + 1)
      : today.getMonth() + 1
  }/${today.getFullYear()}`;

  const time = `${
    today.getHours() + 1 < 10
      ? '0' + (today.getHours() + 1)
      : today.getHours() + 1
  }:${
    today.getMinutes() + 1 < 10
      ? '0' + (today.getMinutes() + 1)
      : today.getMinutes() + 1
  }:${
    today.getSeconds() + 1 < 10
      ? '0' + (today.getSeconds() + 1)
      : today.getSeconds() + 1
  }`;
  today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  const dateTime = date + ' ' + time;
  return dateTime;
};

app.get('/gold', (req, res) => {
  if (!req.session.yourgold) req.session.yourgold = 0;
  if (!req.session.activities) req.session.activities = [];
  if (!req.session.gamestatus) req.session.gamestatus = 'newgame';
  const { yourgold, activities, gamestatus, goal } = req.session;
  res.render('ninjagold.html', { yourgold, activities, gamestatus, goal });
});

app.get('/gold/process_money/:place', (req, res) => {
  const { place } = req.params;
  if (!req.session.yourgold) req.session.yourgold = 0;
  if (!req.session.activities) req.session.activities = [];

  let { yourgold, activities, goal } = req.session;

  const result = findGold(place);
  req.session.yourgold = yourgold + result;

  const date = getDate();

  activities.push({
    id: activities.length + 1,
    place: place.charAt(0).toUpperCase() + place.slice(1),
    earnOrLose: result > 0 ? 'Earn' : 'Lose',
    amonunt: result,
    date: date,
    class: result > 0 ? 'table-success' : 'table-danger',
  });
  if (req.session.yourgold < 0) req.session.gamestatus = 'gameover';
  if (req.session.yourgold > goal) req.session.gamestatus = 'wingame';
  res.redirect('/gold');
});

app.get('/gold/reset', (req, res) => {
  req.session.yourgold = 0;
  req.session.activities = [];
  req.session.gamestatus = 'newgame';
  res.redirect('/gold');
});

app.get('/gold/newgame/:goal', (req, res) => {
  const goal = req.params.goal;
  req.session.gamestatus = 'playing';
  req.session.goal = goal;
  res.send({ ok: true });
});

app.listen(3000, () => console.log('Servidor en puerto 3000'));
