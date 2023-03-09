// usersRouter.ts

import {Router} from 'express';
import {User, insertUserAsync, updateUserAsync, isStrongPassword, deleteUserAsync, getUserById} from './index';

const usersRouter = Router();

// Create a new user
usersRouter.post('/', async (req, res) => {
  try {
    const user: User = req.body;

    // Ensure that the password meets the validation rule
    if (!isStrongPassword(user.password)) {
      throw new Error('Password is not strong enough');
    }

    const createdUser = await insertUserAsync(user);
    let {password, ...maskedPasswordUser} = createdUser;
    res.status(201).json(maskedPasswordUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Error creating user'});
  }
});

// Update an existing user
usersRouter.put('/:id', async (req, res) => {
  try {
    const user: User = {...req.body, ...req.params}
    // Update the user in the database

    if (!user.username && !user.email && !user.password) {
      throw new Error('No user fields to update')
    }

    if (user.password && !isStrongPassword(user.password)) {
      throw new Error('Password is not strong enough');
    }

    const upsertedUser = await updateUserAsync(user);

    let {password, ...maskedPasswordUser} = upsertedUser;
    res.json(maskedPasswordUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Error updating user'});
  }
});

usersRouter.delete('/:id', async (req, res) => {
  const {id} = req.params;

  try {
    const user = await getUserById(parseInt(id));

    if (!user) {
      return res.status(404).json({message: `User with id ${id} not found`});
    }

    await deleteUserAsync(parseInt(id));

    return res.status(200).json({message: 'User deleted successfully'});
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({message: 'Error deleting user'});
  }
});

export default usersRouter;
