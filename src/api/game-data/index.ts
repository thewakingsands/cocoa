import { FastifyInstance } from 'fastify'
import Container from 'typedi'
import { GameDataService } from '../../service/game-data'

export default async function GameData(server: FastifyInstance) {
  const service = Container.get(GameDataService)
  server.get('/content', {}, async () => {
    return service.content()
  })

  server.get<{
    Params: {
      key: string
      id: string
    }
  }>('/:key/:id', {}, async (request) => {
    return service.one(request.params.key, request.params.id, request)
  })

  server.get<{
    Params: {
      key: string
    }
  }>('/:key', {}, async (request) => {
    return service.list(request.params.key, request)
  })
}
