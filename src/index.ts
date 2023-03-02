import express, { Request, Response } from 'express';
import {User, insertUserAsync, updateUserAsync, isStrongPassword, deleteUserAsync, getUserById} from './textmod-users';

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
    let { password, ...maskedPasswordUser } = createdUser;
    res.status(201).json(maskedPasswordUser);
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

    if(!user.username && !user.email && !user.password) {
      throw new Error('No user fields to update')
    }

    if (user.password && !isStrongPassword(user.password)) {
      throw new Error('Password is not strong enough');
    }

    const upsertedUser = await updateUserAsync(user);

    let { password, ...maskedPasswordUser } = upsertedUser;
    res.json(maskedPasswordUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating user' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await getUserById(parseInt(id));

    if (!user) {
      return res.status(404).json({ message: `User with id ${id} not found` });
    }

    await deleteUserAsync(parseInt(id));

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user' });
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
