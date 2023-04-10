import 'dotenv/config'
import { initialScan } from './step/scan'
import {
  checkDatamining,
  downloadServerList,
  getPatchData,
  getSaintCoinachDefinitions,
  getXivapiCom,
} from './step/prepare'

import Redis from 'ioredis'
import { config } from '../src/config/redis'
import { populate } from './step/populate'
import { preScan } from './step/pre-scan'

const force = process.argv.includes('-f')
console.log('force', force)

const tasks = {
  async prepare() {
    await getSaintCoinachDefinitions()
    await getPatchData()
    await getXivapiCom()
    await checkDatamining()
    await downloadServerList()
    await tasks.preScan()
  },

  async preScan() {
    await preScan(force)
  },

  async scan() {
    // init redis
    const redis = new Redis(config)
    try {
      await initialScan(redis, force)
    } finally {
      await redis.quit()
    }
  },

  async populate() {
    // init redis
    const redis = new Redis(config)
    try {
      await populate(redis, force)
    } finally {
      await redis.quit()
    }
  },

  async process() {
    await tasks.scan()
    await tasks.populate()
  },

  async main() {
    await tasks.prepare()
    await tasks.process()
  },
}

void (async () => {
  const action = process.argv
    .slice(2)
    .filter((item) => !item.startsWith('-'))
    .shift()
  const task = Reflect.get(tasks, action as any)

  if (task) {
    await task()
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Invalid action '${action}'`)
  }
})()
