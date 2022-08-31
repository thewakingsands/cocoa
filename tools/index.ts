import 'dotenv/config'
import { buildDataToRedis } from './build'
import { checkDatamining, getPatchData, getSaintCoinachDefinitions } from './prepare'

void (async () => {
  await getSaintCoinachDefinitions()
  await getPatchData()
  await checkDatamining()

  await buildDataToRedis()
})()