import MySQLConnectionManager from '../textmod-mysql';
import {OkPacket, RowDataPacket} from 'mysql2';
import bcrypt from 'bcrypt';
import fs from 'fs';
import crypto from 'crypto';

export interface User extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  email: string;
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

export async function insertUserAsync(user: User): Promise<User> {
  let {username, password, email} = user;

  // Hash the password using bcrypt
  let hashedPassword = ''
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Ensure that the hashed password matches the length of the schema field
  if (hashedPassword.length > 64) {
    throw new Error('Hashed password is too long for database schema');
  }

  const insertParams = [username, hashedPassword, email];

  const insertQuery = `
    INSERT INTO users (username, password, email, created_at, updated_at)
    VALUES (?, ?, ?, NOW(), NOW());`;

  try {
    const connection = await connectionManager.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute<OkPacket>(insertQuery, insertParams);
      const userId = result.insertId;

      await connection.commit();

      const storedUser = await getUserById(userId);
      return {
        ...user,
        ...storedUser,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
}

export async function getUserById(id: number): Promise<User> {
  const selectQuery = 'SELECT id, username, password, email FROM users WHERE id = ?';
  const selectParams = [id];

  const connection = await connectionManager.getConnection();
  const [rows] = await connection.execute<User[]>(selectQuery, selectParams);

  connection.release();

  if (rows.length === 0) {
    throw new Error(`User with id ${id} not found`);
  }

  return rows[0];
}

export async function updateUserAsync(user: User): Promise<User> {
  let {id, username, password, email} = user;

  // Hash the password using bcrypt
  let hashedPassword = ''
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Ensure that the hashed password matches the length of the schema field
  if (hashedPassword.length > 64) {
    throw new Error('Hashed password is too long for database schema');
  }

  interface Params {
    username?: string;
    email?: string;
    password?: string;
  }

  let params: Params = {};

  if (username !== undefined) {
    params.username = username;
  }
  if (email !== undefined) {
    params.email = email;
  }
  if (password !== undefined) {
    params.password = password;
  }

  const updateParams: (string | number)[] = Object.values(params);
  updateParams.push(id);

  let updateQuery = `
    UPDATE users
    SET ${Object.keys(params).map(key => `${key} = ?`).join(', ')}
      , updated_at = NOW()
    WHERE id = ?
  `;
  try {
    const connection = await connectionManager.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute<OkPacket>(updateQuery, updateParams);

      await connection.commit();

      const storedUser = await getUserById(id);

      return {
        ...user,
        ...storedUser
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUserAsync(id: number): Promise<void> {
  const deleteQuery = 'DELETE FROM users WHERE id = ?';
  const deleteParams = [id];

  try {
    const connection = await connectionManager.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute<OkPacket>(deleteQuery, deleteParams);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const selectQuery = 'SELECT id, username, password, email FROM users WHERE email = ?';
  const selectParams = [email];

  const connection = await connectionManager.getConnection();
  const [rows] = await connection.execute<User[]>(selectQuery, selectParams);

  connection.release();

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

export function isStrongPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function generateSecurePassword(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  const randomBytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(randomBytes[i] % chars.length);
  }
  return password;
}