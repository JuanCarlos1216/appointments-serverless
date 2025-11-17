import { createPool, type Pool } from 'mysql2/promise';

let pool: Pool | null = null;

export function getDbPool(): Pool {
    if (!pool) {
        pool = createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectionLimit: 5,
        });
    }
    return pool;
}
