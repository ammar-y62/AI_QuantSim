#!/usr/bin/env node

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully');

    // Check if database exists
    const dbExists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'quantsim']
    );

    if (dbExists.rows.length === 0) {
      console.log(`Creating database: ${process.env.DB_NAME || 'quantsim'}`);
      await client.query(`CREATE DATABASE "${process.env.DB_NAME || 'quantsim'}"`);
      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }

    await client.end();

    // Now connect to the actual database and run schema
    const schemaClient = new Client({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'quantsim'
    });

    await schemaClient.connect();
    console.log('Connected to quantsim database');

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing database schema...');
    await schemaClient.query(schema);
    console.log('Database schema applied successfully');

    await schemaClient.end();
    console.log('Database setup completed successfully! 🎉');

  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;