import Redis from 'ioredis';
import * as fs from 'fs';

class AzureRedisConnectionManager {
  private static instance: AzureRedisConnectionManager;
  private redisClient: Redis;

  private constructor(redisHost: string, redisPort: number, redisPassword: string) {
    const tlsOptions = {
        ca: [fs.readFileSync('./certs/mysql/server-cert.pem')],
        cert: fs.readFileSync('./certs/mysql/server-cert.pem'),
        key: fs.readFileSync('./certs/mysql/server-key.pem'),
        rejectUnauthorized: false
      };
    
    this.redisClient = new Redis(redisPort, redisHost, {
      password: redisPassword,
      tls: tlsOptions
    });
  }

  public static getInstance(redisHost: string, redisPort: number, redisPassword: string): AzureRedisConnectionManager {
    if (!AzureRedisConnectionManager.instance) {
      AzureRedisConnectionManager.instance = new AzureRedisConnectionManager(redisHost, redisPort, redisPassword);
    }
    return AzureRedisConnectionManager.instance;
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    const result = await this.redisClient.get(key);
    return result;
  }

  public async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}

export default AzureRedisConnectionManager;
