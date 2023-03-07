// app.ts

import express from 'express';
import usersRouter from './textmod-users/usersRouter';

const app = express();
app.use(express.json());

// Use the users router for all requests to /api/users
app.use('/api/users', usersRouter);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
