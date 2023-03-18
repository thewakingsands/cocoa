import { Service } from 'typedi'
import { RedisService } from './redis'
import { keys } from '../utils/key'
import { NotFoundError } from '../utils/error'
import { DataFormatService, Row, Stat } from './data-format'
import { Request } from './request'

interface Link {
  path: string[]
  target: string
  id: number | string
  null: boolean
}

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
    if (format.populate) {
      await this.populate(data, def, id, format.populate)
    }

    if (format.enabled) {
      return this.format.processItem(data, format)
    }

    return data
  }

  private async populate(data: Record<string, any>, def: string, id: string, populate: string[]) {
    const links = await this.redis.get<Link[]>(keys.fullLink(def, id))
    if (!links) {
      return
    }

    const apply = (obj: Record<string, any>, path: string[], target: string, id: string | number, value: any) => {
      for (let i = 0; i < path.length - 1; ++i) {
        const part = path[i]
        if (!(part in obj)) {
          obj[part] = {}
        }
        obj = obj[part]
      }

      const key = path[path.length - 1]
      obj[key] = value
      obj[`${key}Target`] = target
      obj[`${key}TargetID`] = id

      return obj
    }

    const tasks: Link[] = []
    for (const link of links) {
      if (!populate.includes(link.path[0])) continue

      if (link.null) {
        apply(data, link.path, link.target, link.id, null)
      } else {
        tasks.push(link)
      }
    }

    if (tasks.length === 0) {
      return
    }

    const values = await this.redis.mget(tasks.map((item) => keys.data(item.target, item.id)))
    const subLinks = await this.redis.mget<Link[]>(tasks.map((item) => keys.fullLink(item.target, item.id)))

    for (let i = 0; i < tasks.length; ++i) {
      const link = tasks[i]
      const value = values[i] ?? null
      apply(data, link.path, link.target, link.id, value)

      // ignore self link
      if (def === link.target) {
        continue
      }

      const taskSubLinks = subLinks[i]
      if (value && taskSubLinks) {
        for (const link of taskSubLinks) {
          if (link.null) {
            apply(value, link.path, link.target, link.id, null)
          } else {
            apply(value, link.path, link.target, link.id, {
              ID: link.id,
            })
          }
        }
      }
    }
  }
}
