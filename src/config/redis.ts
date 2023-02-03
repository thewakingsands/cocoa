import { RedisOptions } from 'ioredis'

export const config: RedisOptions = {
  port: Number(process.env.REDIS_PORT || 6379),
  host: process.env.REDIS_HOST || '127.0.0.1',
  db: Number(process.env.REDIS_DB || 0),
  keyPrefix: process.env.REDIS_KEY_PREFIX || '',
}

if (process.env.REDIS_PASSWORD) {
  config.username = process.env.REDIS_USERNAME || 'default'
  config.password = process.env.REDIS_PASSWORD
}
