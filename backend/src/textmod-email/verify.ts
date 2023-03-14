import MySQLConnectionManager from '../textmod-mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import fs from 'fs';

const sslOptions = {
    ca: fs.readFileSync('./certs/mysql/server-cert.pem'),
    cert: fs.readFileSync('./certs/mysql/server-cert.pem'),
    key: fs.readFileSync('./certs/mysql/server-key.pem'),
    rejectUnauthorized: false,
};

const config = {
    host: process.env.DB_HOST || 'textmod-mysql-server.mysql.database.azure.com',
    user: process.env.DB_USER || 'textmod_admin@textmod-mysql-server',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'textmod',
    connectionLimit: 10,
    ssl: sslOptions,
};

const connectionManager = new MySQLConnectionManager(config);

export interface VerifyEmail extends RowDataPacket {
    id?: number;
    user_id: number;
    verified_at?: Date;
}

export default class VerifiedEmails {
    constructor() { }

    async create(email: VerifyEmail): Promise<VerifyEmail> {
        const conn = await connectionManager.getConnection();
        await conn.beginTransaction(); // start a transaction

        try {
            const result = await conn.execute(
                'INSERT INTO verified_emails (user_id) VALUES (?)',
                [email.user_id]
            ) as unknown as ResultSetHeader

            const insertId = result.insertId;

            const [rows] = await conn.execute<VerifyEmail[]>(
                'SELECT * FROM verified_emails WHERE id = ?',
                [insertId]
            );

            const row = rows[0] as VerifyEmail;

            if (row.verified_at) {
                row.verified_at = new Date(row.verified_at);
            }

            await conn.commit(); // commit the transaction

            return row;
        } catch (error) {
            await conn.rollback(); // rollback the transaction if there is an error
            throw error;
        } finally {
            conn.release();
        }
    }

    async read(id: number): Promise<VerifyEmail | null> {
        const conn = await connectionManager.getConnection();
        try {
            const [rows] = await conn.execute<VerifyEmail[]>(
                'SELECT * FROM verified_emails WHERE id = ?',
                [id]
            );
            if (rows.length) {
                const row = rows[0] as VerifyEmail;
                if (row.verified_at) {
                    row.verified_at = new Date(row.verified_at);

                    row.verified_at = new Date(row.verified_at);
                }
                return row;
            }
            return null;
        } finally {
            conn.release();
        }
    }

    async update(email: VerifyEmail): Promise<boolean> {
        const conn = await connectionManager.getConnection();
        await conn.beginTransaction(); // start a transaction

        try {
            const result = await conn.execute(
                'UPDATE verified_emails SET user_id = ?, verified_at = ? WHERE id = ?',
                [email.user_id, email.verified_at, email.id]
            ) as unknown as ResultSetHeader;

            await conn.commit(); // commit the transaction

            return result.affectedRows > 0;
        } catch (error) {
            await conn.rollback(); // rollback the transaction if there is an error
            throw error;
        } finally {
            conn.release();
        }
    }

    async delete(id: number): Promise<boolean> {
        const conn = await connectionManager.getConnection();
        await conn.beginTransaction(); // start a transaction

        try {
            const result = await conn.execute(
                'DELETE FROM verified_emails WHERE id = ?',
                [id]
            ) as unknown as ResultSetHeader;

            await conn.commit(); // commit the transaction

            return result.affectedRows > 0;
        } catch (error) {
            await conn.rollback(); // rollback the transaction if there is an error
            throw error;
        } finally {
            conn.release();
        }
    }
}
