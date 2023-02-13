import Redis from 'ioredis'
import { Service } from 'typedi'
import { config } from '../config/redis'
import { tryParseJson } from '../utils/json'

@Service()
export class RedisService {
  public readonly redis: Redis

  public constructor() {
    this.redis = new Redis(config)
  }

  public async get<T>(key: string): Promise<T | null> {
    const content = await this.redis.get(key)
    if (content) {
      return tryParseJson(content) || null
    }

    return null
  }

  public async set<T>(key: string, value: T, maxAge = 0): Promise<void> {
    if (maxAge === 0) {
      await this.redis.set(key, JSON.stringify(value))
    } else {
      await this.redis.set(key, JSON.stringify(value), 'PX', maxAge)
    }
  }

  public async mget<T>(keys: string[]): Promise<(T | undefined)[]> {
    const values = await this.redis.mget(keys)
    return values.map((item) => tryParseJson<T>(item))
  }
}
