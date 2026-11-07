import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

export const pool = new Pool({ connectionString: process.env.SUPABASE_POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })
