import MySQLConnectionManager from '../textmod-mysql';
import {OkPacket, RowDataPacket} from 'mysql2';
import bcrypt from 'bcrypt';
import fs from 'fs';

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
  let  {username, password, email} = user;

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
      const storedUser = await getUserById(userId);

      await connection.commit();

      return {
        ...storedUser,
        ...user,
        id: userId,
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

async function getUserById(id: number): Promise<User> {
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
  let  {id, username, password, email} = user;

  // Hash the password using bcrypt
  let hashedPassword = ''
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Ensure that the hashed password matches the length of the schema field
  if (hashedPassword.length > 64) {
    throw new Error('Hashed password is too long for database schema');
  }

  username = username ?? null
  email = email ?? null

  const updateParams = [username, hashedPassword ?? null, email, id];

  let updateQuery = `
    UPDATE users
    SET
      ${username !== null ? `username = ?,` : ''}
      ${password !== null ? `password = ?,` : ''}
      ${email !== null ? `email = ?,` : ''}
      updated_at = NOW()
    WHERE id = ?`;

  // remove the last comma from the query string
  updateQuery = updateQuery.replace(/,\s*$/, '');

  try {
    const connection = await connectionManager.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute<OkPacket>(updateQuery, updateParams);

      const storedUser = await getUserById(id);

      await connection.commit();

      return {
        ...storedUser[0],
        ...user
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

export function isStrongPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}
