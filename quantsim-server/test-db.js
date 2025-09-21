const { Pool } = require('pg');

const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'quantsim',
  password: 'postgres',
  port: 5432,
};

console.log('Testing database connection...');
const pool = new Pool(dbConfig);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully:', res.rows[0]);
  }
  pool.end();
});
