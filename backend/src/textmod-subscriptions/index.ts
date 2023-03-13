import MySQLConnectionManager from '../textmod-mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import fs from 'fs';

export default interface Subscription {
  id: number;
  userId: number;
  stripeCustomerId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'canceled';
  stripeSubscriptionId: string;
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



interface CreateSubscriptionParams {
  userId: number;
  stripeCustomerId: string;
  startDate: Date;
  endDate: Date;
  status?: 'active' | 'canceled';
  stripeSubscriptionId: string;
}

interface CreateSubscriptionResult {
  id: number;
  userId: number;
  stripeCustomerId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'canceled';
  stripeSubscriptionId: string;
}

export async function createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
  const { userId, stripeCustomerId, startDate, endDate, status = 'active', stripeSubscriptionId } = params;
  const connection = await connectionManager.getConnection();
  try {
    await connection.beginTransaction();
    const result = await connection.query(
      `INSERT INTO subscriptions (user_id, stripe_customer_id, start_date, end_date, status, stripe_subscription_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, stripeCustomerId, startDate, endDate, status, stripeSubscriptionId]
    ) as unknown as ResultSetHeader
    const subscription = { id: result.insertId, userId, stripeCustomerId, startDate, endDate, status, stripeSubscriptionId };
    await connection.commit();
    return subscription;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}


export interface UpdateSubscriptionParams {
  id: number;
  userId?: number;
  stripeCustomerId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'active' | 'canceled';
  stripeSubscriptionId?: string;
}

interface UpdateSubscriptionResult {
  affectedRows: number;
}

export async function updateSubscription(params: UpdateSubscriptionParams): Promise<UpdateSubscriptionResult> {
  const { id, userId, stripeCustomerId, startDate, endDate, status, stripeSubscriptionId } = params;
  const connection = await connectionManager.getConnection();
  try {
    await connection.beginTransaction();
    const fields: string[] = [];
    const values: (string | number | Date | null | undefined)[] = [];
    if (userId !== undefined) {
      fields.push('user_id = ?');
      values.push(userId);
    }
    if (stripeCustomerId !== undefined) {
      fields.push('stripe_customer_id = ?');
      values.push(stripeCustomerId);
    }
    if (startDate !== undefined) {
      fields.push('start_date = ?');
      values.push(startDate);
    }
    if (endDate !== undefined) {
      fields.push('end_date = ?');
      values.push(endDate);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (stripeSubscriptionId !== undefined) {
      fields.push('stripe_subscription_id = ?');
      values.push(stripeSubscriptionId);
    }
    if (fields.length === 0) {
      throw new Error('At least one field to update must be provided');
    }
  const sql = `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`;
  const result = await connection.query(sql, [...values, id]) as unknown as ResultSetHeader
  await connection.commit();
  return { affectedRows: result.affectedRows };
} catch (err) {
  await connection.rollback();
  throw err;
} finally {
  connection.release();
}
}