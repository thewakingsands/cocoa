import 'reflect-metadata'
import 'dotenv/config'

import fastifyCors from 'fastify-cors'
import fastify from 'fastify'
import { createLogger } from './utils/createLogger'
import GameData from './api/game-data'

const logger = createLogger('main')
main().catch(console.error)

async function main() {
  const roles = (process.argv[2] || 'http').split(',')
  const roleStarters: Record<string, () => Promise<void>> = {
    http: startHttp,
  }

  for (const role of roles) {
    if (!roleStarters[role]) {
      logger.warn(`No role starter for role ${role}`)
      continue
    }

    logger.info(`[+] Role ${role}`)
    await roleStarters[role]()
  }

  logger.info('--------------------')
  logger.info(' Cocoa started')
  logger.info('--------------------')
}

async function startHttp() {
  const port = Number(process.env.PORT || 3000)
  const server = fastify()

  // banner
  server.addHook('onRequest', (request, reply, done) => {
    void reply.header('Server', 'Cocoa')
    done()
  })

  // middlewares
  await server.register(fastifyCors)

  // api
  await server.register(GameData)

  const address = await server.listen({ port })
  logger.info(`HTTP Server listening at ${address}`)
}
