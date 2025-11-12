#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match && !line.startsWith('#')) {
    env[match[1]] = match[2];
  }
});

const config = {
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT),
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
};

console.log('\n🔍 Testing Supabase PostgreSQL Connection...\n');
console.log('Configuration:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  Database: ${config.database}`);
console.log(`  User: ${config.user}`);
console.log('\n⏳ Connecting...\n');

const client = new pg.Client(config);

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL!\n');

    // Test query
    const result = await client.query('SELECT NOW(), version()');
    console.log('Database Info:');
    console.log(`  Server Time: ${result.rows[0].now}`);
    console.log(`  Version: ${result.rows[0].version.split(',')[0]}\n`);

    // Check if users table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
      ) as exists;
    `);

    if (tableResult.rows[0].exists) {
      console.log('✅ Users table exists\n');

      const countResult = await client.query('SELECT COUNT(*) FROM users');
      console.log(`Users in database: ${countResult.rows[0].count}\n`);
    } else {
      console.log('⚠️  Users table not found\n');
    }

    console.log('🎉 Supabase connection verified successfully!\n');
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(`  Error: ${err.message}\n`);
    process.exit(1);
  } finally {
    await client.end();
  }
})();

