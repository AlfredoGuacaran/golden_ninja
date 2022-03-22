const pg = require('pg');
const { Pool } = pg;

const config = {
  user: 'postgres',
  host: 'localhost',
  password: '1234',
  database: 'cursos',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);

async function getCursos() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT * from cursos');
    client.release();
    return res.rows;
  } catch (error) {
    throw error;
  }
}

async function nuevoCurso(nombre, nivel, fecha, duracion) {
  try {
    const client = await pool.connect();
    const res = await client.query({
      text: 'INSERT INTO cursos (nombre, nivel, fecha, duracion) values ($1,$2,$3,$4)',
      values: [nombre, nivel, fecha, duracion],
    });
    client.release();
    return res.rows ? 'Curso registrado con exito' : 'Error';
  } catch (error) {
    throw error;
  }
}

async function editarCurso(id, nombre, nivel, fecha, duracion) {
  try {
    const client = await pool.connect();
    const res = await client.query({
      text: 'UPDATE cursos SET nombre = $2, nivel = $3, fecha = $4, duracion = $5 WHERE id = $1',
      values: [id, nombre, nivel, fecha, duracion],
    });
    client.release();
    return res.rows ? 'Curso registrado con exito' : 'Error';
  } catch (error) {
    throw error;
  }
}

async function borrarCurso(curso) {
  try {
    const client = await pool.connect();
    const res = await client.query({
      text: 'DELETE FROM cursos WHERE id = $1',
      values: [curso],
    });
    client.release();
    return res.rows ? 'Curso eliminado con exito' : 'Error';
  } catch (error) {
    throw error;
  }
}

// module.exports = { getCursos };
