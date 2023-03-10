// app.ts

import express from 'express';
import usersRouter from './textmod-users/usersRouter';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import keysRouter from './textmod-apikeys/keysRouter';

const app = express();
app.use(cookieParser());
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// Use the users router for all requests to /api/users
app.use('/api/users', usersRouter);

// Use the users router for all requests to /api/keys
app.use('/api/keys', keysRouter);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
