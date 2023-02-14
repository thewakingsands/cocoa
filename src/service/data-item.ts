import { Service } from 'typedi'
import { RedisService } from './redis'
import { keys } from '../utils/key'
import { NotFoundError } from '../utils/error'
import { DataFormatService, Row, Stat } from './data-format'
import { Request } from './request'

@Service()
export class DataItemService {
  public constructor(public redis: RedisService, private format: DataFormatService) {}

  public async handler(def: string, id: string, request: Request) {
    const stat = await this.redis.get<Stat>(keys.stat(def))

    // no ids? end
    if (!stat || stat.count === 0) {
      throw new NotFoundError(`No content data found for: ${def}`)
    }

    const data = await this.redis.get<Row>(keys.data(def, id))
    if (!data) {
      throw new NotFoundError(`Game Data does not exist: ${def} ${id}`)
    }

    const format = this.format.getFormatParams(request, stat, true)
    if (format.enabled) {
      return this.format.processItem(data, format)
    }

    return data
  }
}
