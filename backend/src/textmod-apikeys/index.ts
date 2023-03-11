import MySQLConnectionManager from '../textmod-mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import fs from 'fs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface ApiKey extends RowDataPacket {
    id?: number;
    userId: number;
    key: string;
    permissions: object | string;
    expirationDate: Date | string;
}

const sslOptions = {
    ca: fs.readFileSync('./certs/mysql/server-cert.pem'),
    cert: fs.readFileSync('./certs/mysql/server-cert.pem'),
    key: fs.readFileSync('./certs/mysql/server-key.pem'),
    rejectUnauthorized: false
};

const config = {
    host: process.env.DB_HOST || 'textmod-mysql-server.mysql.database.azure.com',
    user: process.env.DB_USER || 'textmod_admin@textmod-mysql-server',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'textmod',
    connectionLimit: 10,
    ssl: sslOptions
};

const connectionManager = new MySQLConnectionManager(config);


async function createApiKey(apiKey: ApiKey): Promise<ApiKey> {
    const conn = await connectionManager.getConnection();
    try {
        await conn.beginTransaction();

        const stmt = await conn.prepare(`INSERT INTO api_keys (user_id, \`key\`, permissions, expiration_date) VALUES (?, ?, ?, ?)`);
        const values = [apiKey.userId, apiKey.key, JSON.stringify(apiKey.permissions), apiKey.expirationDate];
        const result = await stmt.execute(values) as unknown as ResultSetHeader
        apiKey.id = result.insertId;

        await conn.commit();
        return apiKey;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}


async function getApiKeyByKey(key: string): Promise<ApiKey | null> {
    const conn = await connectionManager.getConnection();
    try {
        const sql = `SELECT * FROM api_keys WHERE \`key\` = ?`;
        const [rows] = await conn.execute<ApiKey[]>(sql, [key]);
        const apiKey = rows[0];
        if (apiKey) {
            apiKey.permissions = JSON.parse(apiKey.permissions as string);
            apiKey.expirationDate = new Date(apiKey.expiration_date);

            return apiKey;
        } else {
            return null;
        }
    } finally {
        conn.release();
    }
}

async function getApiKeyByUserId(userId: number): Promise<ApiKey | null> {
    const conn = await connectionManager.getConnection();
    try {
        const sql = `SELECT * FROM api_keys WHERE user_id = ?`;
        const [rows] = await conn.execute<ApiKey[]>(sql, [userId]);
        const apiKey = rows[0];
        if (apiKey) {
            apiKey.permissions = JSON.parse(apiKey.permissions as string);
            apiKey.expirationDate = new Date(apiKey.expiration_date);

            return apiKey;
        } else {
            return null;
        }
    } finally {
        conn.release();
    }
}

async function deleteApiKeyByKey(key: string): Promise<void> {
    const conn = await connectionManager.getConnection();
    try {
        const sql = `DELETE FROM api_keys WHERE \`key\` = ?`;
        const values = [key];
        await conn.execute(sql, values);
    } finally {
        conn.release();
    }
}

function generateApiKey(): string {
    const apiKeyBytes = crypto.randomBytes(32);
    const apiKey = apiKeyBytes.toString('hex');
    return apiKey;
  }

  
  interface CustomRequest extends Request {
    apiKey?: string;
  }

  async function apiKeyValidationMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Unauthorized');
    }
    
    const token = authHeader.substring(7); // remove "Bearer " prefix
    
    const apiKey = await getApiKeyByKey(token);
    if (!apiKey) {
      return res.status(401).send('Invalid API key');
    }

    const expirationDate = apiKey.expirationDate as Date

    if (expirationDate.getTime() < Date.now()) {
        return res.status(401).send('API key has expired');
      }
    
    // attach the apiKey object to the request for use in subsequent middleware/handlers
    req.apiKey = apiKey.key;
    
    next();
  }

export { createApiKey, getApiKeyByKey, deleteApiKeyByKey, generateApiKey, getApiKeyByUserId, apiKeyValidationMiddleware, CustomRequest};
