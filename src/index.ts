import express, { Request, Response } from 'express';
import {User, insertUserAsync, updateUserAsync, isStrongPassword} from './textmod-users';

const app = express();

app.use(express.json());

// Create a new user
app.post('/users', async (req: Request, res: Response) => {
  try {
    const user: User = req.body;

    // Ensure that the password meets the validation rule
    if (!isStrongPassword(user.password)) {
      throw new Error('Password is not strong enough');
    }

    const createdUser = await insertUserAsync(user);
    res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Update an existing user
app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const user: User = {...req.body, ...req.params }
    // Update the user in the database

    if (user.password && !isStrongPassword(user.password)) {
      throw new Error('Password is not strong enough');
    }

    const upsertedUser = await updateUserAsync(user);
    res.json(upsertedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating or creating user' });
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
