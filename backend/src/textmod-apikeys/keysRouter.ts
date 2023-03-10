import { Router, Request, Response } from 'express';
import { createApiKey, getApiKeyByKey, deleteApiKeyByKey, ApiKey, generateApiKey, getApiKeyByUserId } from './index';
import { verifyAccessToken, CustomRequest } from '../textmod-users/token';

const keysRouter = Router();

// Create a new API key
keysRouter.post('/', verifyAccessToken, async (req: CustomRequest, res: Response) => {
    const now = new Date();
    const date1yFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    const apiKey = {
        userId: req.userId,
        key: generateApiKey(),
        permissions: { read: true, write: false },
        expirationDate: date1yFromNow.toISOString().slice(0, 10)
    } as ApiKey;

    try {
        const createdApiKey = await createApiKey(apiKey);
        res.status(201).json(createdApiKey);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating API key');
    }
});

// Get an API key by key
keysRouter.get('/:key', verifyAccessToken, async (req: CustomRequest, res: Response) => {
    const key = req.params.key;
    try {
        const foundApiKey = await getApiKeyByKey(key);
        if (foundApiKey) {
            // Check if the requesting user is authorized to access the API key
            if (foundApiKey.user_id == req.userId) {
                let { id, user_id, expiration_date, ...maskedPasswordApiKey } = foundApiKey;
                res.json(maskedPasswordApiKey);
            } else {
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(404).send('API key not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error getting API key');
    }
});

keysRouter.get('/', verifyAccessToken, async (req: CustomRequest, res: Response) => {
    const userId = req.userId as number
    try {
        const foundApiKey = await getApiKeyByUserId(userId);
        if (foundApiKey) {
            // Check if the requesting user is authorized to access the API key
            if (foundApiKey.user_id == req.userId) {
                let { id, user_id, expiration_date, ...maskedPasswordApiKey } = foundApiKey;
                res.json(maskedPasswordApiKey);
            } else {
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(404).send('API key not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error getting API key');
    }
});

// Delete an API key by key
keysRouter.delete('/:key', verifyAccessToken, async (req: CustomRequest, res: Response) => {
    const key = req.params.key;
    try {
        const foundApiKey = await getApiKeyByKey(key);
        if (foundApiKey) {
            // Check if the requesting user is authorized to delete the API key
            if (foundApiKey.user_id == req.userId) {
                await deleteApiKeyByKey(key);
                res.send(`Deleted API key with key ${key}`);
            } else {
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(404).send('API key not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting API key');
    }
});

export default keysRouter;

