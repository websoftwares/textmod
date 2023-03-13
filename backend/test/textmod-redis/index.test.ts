import { exit } from "process";
import test from "tape";
import AzureRedisConnectionManager from "../../src/textmod-redis/index"

test('AzureRedisConnectionManager', async t => {
    const redisHost = process.env.AZ_CACHE_REDIS_HOST as string
    const redisPort = process.env.AZ_CACHE_REDIS_PORT as unknown as number
    const redisPassword = process.env.AZ_CACHE_REDIS_PASSWORD as string
    
    const redisManager = AzureRedisConnectionManager.getInstance(redisHost, redisPort, redisPassword);
    

  const key = 'test:key';
  const value = 'test:value';
  const ttl = 1; // in seconds

  try {
    await redisManager.set(key, value);
    t.pass('set key-value pair');

    const result = await redisManager.get(key);
    t.equal(result, value, 'get value for key');

    await redisManager.set(key, value, ttl);
    t.pass('set key-value pair with TTL');

    await new Promise(resolve => setTimeout(resolve, (ttl + 1) * 1000));
    const expiredResult = await redisManager.get(key);
    t.equal(expiredResult, null, 'key expired after TTL');

    await redisManager.del(key);
    t.pass('deleted key');

    t.end();
    exit(0)
  } catch (error) {
    const err = error as Error
    t.fail(err.message);
    t.end();
    exit(1)
  }
});
