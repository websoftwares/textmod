// app.ts

import express, { Request, Response, NextFunction } from 'express';
import usersRouter from './textmod-users/usersRouter';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import keysRouter from './textmod-apikeys/keysRouter';
import promptRouter from './textmod-prompt/promptRouter';
import subscriptionsRouter from './textmod-subscriptions/subscriptionsRouter';
import subscriptionsWebhookRouter from './textmod-subscriptions/subscriptionsWebhookRouter';

const app = express();
app.use(cookieParser());
app.use(express.json());

// Enable CORS for all origins
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Catch-all error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Handle the error here, e.g.:
  console.log(err);

  // Send an appropriate response to the client
  res.status(500).json({
    message: 'An error occurred',
    error: err.message
  });
});

// Use the users router for all requests to /api/users
app.use('/api/users', usersRouter);

// Use the users router for all requests to /api/keys
app.use('/api/keys', keysRouter);

app.use('/api/text', promptRouter);

app.use('/api/subscriptions', subscriptionsRouter);

app.use('/webhook/subscriptions', subscriptionsWebhookRouter);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
