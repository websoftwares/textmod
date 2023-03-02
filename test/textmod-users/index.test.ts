import test from 'tape'
import { User, insertUserAsync, updateUserAsync, deleteUserAsync } from '../../src/textmod-users';
import MySQLConnectionManager from '../../src/textmod-mysql';
import bcrypt from 'bcrypt';
import fs from 'fs';

let connectionManager: MySQLConnectionManager;

test('insertUserAsync,  updateUserAsync should create and update a new user in the database', async (t) => {
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

  connectionManager = new MySQLConnectionManager(config);

  let user = {
    username: 'testuser',
    password: 'Password123@',
    email: 'testuser@example.com'
  } as User;

  try {
    const result = await insertUserAsync(user);
    // Verify that the result is not null and has the correct properties
    t.ok(result, 'Result should not be null');
    t.equal(result.username, user.username, 'Username should match');
    t.equal(result.email, user.email, 'Email should match');
    // Verify that the password is hashed correctly
    const isMatch = await bcrypt.compare(user.password, result.password);
    t.ok(isMatch, 'Password should be hashed correctly');
    user.id = result.id
    user.username = "jan"
    user.password = ''

    const result2 = await updateUserAsync(user)
    t.equal(result2.username, user.username, 'Username should match');

    await deleteUserAsync(user.id)

  } catch (err) {
    const error = err as Error;
    t.fail(error.message);
  } finally {
    t.end();
  }
});

test('teardown', async (t) => {
  try {
    await connectionManager.end();
    t.pass('Connection manager closed successfully');
  } catch (err) {
    const error = err as Error;
    t.fail(error.message);
  } finally {
    t.end();
  }
});

test.onFinish(() => {
  process.exit(0);
});
