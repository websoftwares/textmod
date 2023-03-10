import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Function to generate a random string (e.g. UUID)
export function generateRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

export interface CustomRequest extends Request {
  userId?: number;
}

// Function to generate a secure access token
export function generateAccessToken(userId: number): string {
    // Generate a random string for the token
    const token = generateRandomString(64);

    // Get the current timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Concatenate the token and timestamp with a separator
    const data = `${userId}:${token}:${timestamp}`;

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenSecret) {
        throw new Error('ACCESS_TOKEN_SECRET environment variable is not defined');
    }

    // Sign the data using a secure algorithm (e.g. HMAC-SHA256)
    const signature = crypto.createHmac('sha256', accessTokenSecret)
        .update(data)
        .digest('hex');


    // Concatenate the data and signature with a separator to form the access token
    const accessToken = `${data}:${signature}`;

    return accessToken;
}

export function verifyAccessToken(req: CustomRequest, res: Response, next: NextFunction) {
    // Get the access token from the access_token cookie
    const accessToken = req.cookies.access_token;
  
    // If there's no access token, return an error response
    if (!accessToken) {
      console.log('ERROR: Access token not found');
      return res.status(401).json({ message: 'Access denied' });
    }
  
    try {
        // Split the access token into its parts (userId, token, timestamp, signature)
        const [userId, token, timestamp, signature] = accessToken.split(':');
    
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        if (!accessTokenSecret) {
            throw new Error('ACCESS_TOKEN_SECRET environment variable is not defined');
        }

        // Verify the signature by recomputing it from the data using the same algorithm and secret
        const data = `${userId}:${token}:${timestamp}`;
        const computedSignature = crypto.createHmac('sha256', accessTokenSecret)
          .update(data)
          .digest('hex');
    
        // If the signatures don't match, the token is invalid
        if (computedSignature !== signature) {
          return res.status(401).json({ message: 'Access token invalid' });
        }
    
        const accessTokenExpirationTime = process.env.ACCESS_TOKEN_EXPIRATION_TIME;
        if (!accessTokenExpirationTime) {
          throw new Error('ACCESS_TOKEN_EXPIRATION_TIME environment variable is not defined');
        }
        
        const expirationTime = Number(accessTokenExpirationTime);
        if (isNaN(expirationTime)) {
          throw new Error('ACCESS_TOKEN_EXPIRATION_TIME is not a valid number');
        }
        
        // If the timestamp is too old, the token is expired
        if (Date.now() - Number(timestamp) * 1000 > expirationTime) {
          return res.status(401).json({ message: 'Access token expired' });
        }
    
        // Attach the user ID to the request object for later use
        req.userId = userId;
    
        // Call the next middleware function
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Access token invalid' });
      }
  }