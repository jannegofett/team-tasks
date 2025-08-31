import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Create a single pool instance to be reused
const globalForPool = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool = globalForPool.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/team_tasks",
  max: 10, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Connection timeout after 2 seconds
  maxUses: 7500, // Close connections after 7500 queries
});

// In development, store the pool in global scope to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPool.pool = pool;
}

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('New client connected to database');
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

export const db = drizzle(pool);