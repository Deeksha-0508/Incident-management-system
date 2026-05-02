import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const initPostgres = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_items (
        id UUID PRIMARY KEY,
        component_id VARCHAR(255) NOT NULL,
        severity VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
        signal_count INTEGER DEFAULT 1,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        mttr_minutes INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rca_records (
        id UUID PRIMARY KEY,
        work_item_id UUID REFERENCES work_items(id),
        incident_start TIMESTAMP NOT NULL,
        incident_end TIMESTAMP NOT NULL,
        root_cause_category VARCHAR(100) NOT NULL,
        fix_applied TEXT NOT NULL,
        prevention_steps TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ PostgreSQL initialized');
  } finally {
    client.release();
  }
};
