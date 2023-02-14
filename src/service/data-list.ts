import { Service } from 'typedi'
import { RedisService } from './redis'
import { keys } from '../utils/key'
import { NotFoundError } from '../utils/error'
import { Request, RequestService } from './request'
import { DataFormatService, Row, Stat } from './data-format'

const MAX_ITEMS = 3000
const DEFAULT_ITEMS = 100

@Service()
export class DataListService {
  public constructor(public redis: RedisService, private request: RequestService, private format: DataFormatService) {}

  public async handler(def: string, request: Request) {
    const stat = await this.redis.get<Stat>(keys.stat(def))

    // no ids? end
    if (!stat || stat.count === 0) {
      return null
    }

    // max_items (alias limit, deprecate max_items)
    const limit = this.request.limit(request, DEFAULT_ITEMS, MAX_ITEMS)
    const page = this.request.page(request)

    const offset = (page - 1) * limit
    if (offset >= stat.count) {
      throw new NotFoundError(`No content available on page: ${page} for: ${def}`)
    }

    const ids = await this.redis.redis.lrange(keys.list(def), offset, offset + limit)
    if (ids.length === 0) {
      throw new NotFoundError(`No content available on page: ${page} for: ${def}`)
    }

    let data = await this.redis.mget<Row>(ids.map((id) => keys.data(def, id)))

    const format = this.format.getFormatParams(request, stat)
    if (format.enabled) {
      data = this.format.processArray(data, format)
    }
    return {
      Pagination: this.pagination(stat.count, ids.length, page, limit),
      Results: data,
    }
  }

  private pagination(total: number, count: number, page: number, limit: number) {
    const pageTotal = total > 0 ? Math.ceil(total / limit) : 0
    const pageNext = page + 1 <= pageTotal ? page + 1 : null
    const pagePrev = page - 1 > 0 ? page - 1 : null

    return {
      Page: page,
      PageNext: pageNext,
      PagePrev: pagePrev,
      PageTotal: pageTotal,
      Results: count,
      ResultsPerPage: limit,
      ResultsTotal: total,
    }
  }
}
