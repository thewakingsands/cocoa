import 'dotenv/config'
import { initialScan } from './step/scan'
import { checkDatamining, getPatchData, getSaintCoinachDefinitions } from './prepare'

import Redis from 'ioredis'
import { config } from '../src/config/redis'

const force = process.argv.includes('-f')
console.log('force', force)

void (async () => {
  await getSaintCoinachDefinitions()
  await getPatchData()
  await checkDatamining()

  // init redis
  const redis = new Redis(config)

  try {
    await initialScan(redis, force)
  } finally {
    await redis.quit()
  }
})()