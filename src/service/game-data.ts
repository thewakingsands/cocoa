import { FastifyRequest } from 'fastify'
import { Service } from 'typedi'
import { NotFoundError } from '../utils/error'
import { keys } from '../utils/key'
import { DataItemService } from './data-item'
import { DataListService } from './data-list'
import { RedisService } from './redis'

@Service()
export class GameDataService {
  private definitions: Set<string>
  private lookup: Map<string, string>

  public constructor(
    public redis: RedisService,
    private listService: DataListService,
    private itemService: DataItemService,
  ) {
    const lookup = new Map<string, string>()
    this.lookup = lookup
    this.definitions = new Set()

    void redis
      .get<string[]>(keys.definitions)
      .then((res) => {
        this.definitions = new Set(res)

        if (res) {
          for (const item of res) {
            lookup.set(item.toLowerCase(), item)
          }
        }
      })
      .catch(() => {
        /* noop */
      })
  }

  public content() {
    return Array.from(this.definitions)
  }

  public normalize(definition: string) {
    return this.lookup.get(definition.toLowerCase())
  }

  public async list(key: string, request: FastifyRequest<any>) {
    const def = this.normalize(key)
    if (!def) {
      throw new NotFoundError(`Definition '${key}' not found`)
    }

    return await this.listService.handler(def, request)
  }

  public async one(key: string, id: string, request: FastifyRequest<any>) {
    const def = this.normalize(key)
    if (!def) {
      throw new NotFoundError(`Definition '${key}' not found`)
    }

    return await this.itemService.handler(def, id, request)
  }
}
