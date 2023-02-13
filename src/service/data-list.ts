import { Service } from 'typedi'
import { RedisService } from './redis'
import { keys } from '../utils/key'
import { NotFoundError } from '../utils/error'
import { FastifyRequest } from 'fastify'
import { LANGUAGES, MAIN_LANGUAGE } from '../config/game'

const MAX_ITEMS = 3000
const DEFAULT_ITEMS = 100

type Request = FastifyRequest<{
  Querystring: {
    max_items?: string
    limit?: string
    page?: string

    columns?: string
    columns_all?: string
    language?: string
    no_post_process?: string
  }
}>

interface Stat {
  count: number
  strings: string[]
  externals: string[]
}

@Service()
export class DataListService {
  public constructor(public redis: RedisService) {}

  public async handler(def: string, request: Request) {
    const stat = await this.redis.get<Stat>(keys.stat(def))

    // no ids? end
    if (!stat || stat.count === 0) {
      return null
    }

    // max_items (alias limit, deprecate max_items)
    const limit = this.limit(request)
    const page = this.page(request)

    const offset = (page - 1) * limit
    if (offset >= stat.count) {
      throw new NotFoundError(`No content available on page: ${page} for: ${def}`)
    }

    const ids = await this.redis.redis.lrange(keys.list(def), offset, offset + limit)
    if (ids.length === 0) {
      throw new NotFoundError(`No content available on page: ${page} for: ${def}`)
    }

    let data = await this.redis.mget<Record<string, any> | null>(ids.map((id) => keys.data(def, id)))

    const { no_post_process: skipProcess } = request.query
    if (!skipProcess) {
      const [columns, hasPrimaryStrings] = this.columns(request, stat.strings)
      const language = hasPrimaryStrings && this.language(request)

      if (columns !== true || language) {
        data = data.map((row) => {
          if (!row) {
            return null
          }

          if (language) {
            this.handleMainLanguage(row, stat.strings, language)
          }

          if (columns === true) {
            return row
          }

          return this.extract(row, columns)
        })
      }
    }
    return {
      Pagination: this.pagination(stat.count, ids.length, page, limit),
      Results: data,
    }
  }

  /**
   * Change primary string to selected language
   * @param row Row
   * @param strings Columns which are string
   * @param language Selected language
   */
  private handleMainLanguage(row: Record<string, any>, strings: string[], language: string) {
    for (const key of strings) {
      row[key] = row[`${key}_${language}`]
    }
  }

  /**
   * Extract selected columns of row
   * @param row Row
   * @param columns Columns
   * @returns Row with only selected columns
   */
  private extract(row: Record<string, any>, columns: string[]) {
    const output: Record<string, any> = {}
    for (const key of columns) {
      if (key in row) {
        output[key] = row[key]
      }
    }

    return output
  }

  /* Request param extractors begins */
  private limit(request: Request) {
    const maxItems = parseInt(request.query.max_items ?? request.query.limit ?? '', 10)
    if (!maxItems || maxItems < 0) {
      return DEFAULT_ITEMS
    }

    if (maxItems > MAX_ITEMS) {
      return MAX_ITEMS
    }

    return maxItems
  }

  private page(request: Request) {
    const page = parseInt(request.query.page ?? '', 10)
    if (!page || page < 1) {
      return 1
    }

    return page
  }

  /**
   * Parse requested columns and check if has primary strings
   * @param request Request
   * @param strings Strings in table
   * @returns [columns, hasPrimaryStrings]
   */
  private columns(request: Request, strings: string[]): [true | string[], boolean] {
    if (request.query.columns_all) {
      return [true, true]
    }

    const columns = request.query.columns
    if (columns) {
      let hasPrimaryStrings = false
      const input = new Set(columns.split(','))
      const output: string[] = []

      for (const item of input) {
        if (item.endsWith('_*')) {
          const prefix = item.slice(0, item.length - 2)
          if (!strings.includes(prefix)) continue

          for (const lang of LANGUAGES) {
            output.push(`${prefix}_${lang}`)
          }
        } else {
          if (strings.includes(item)) {
            hasPrimaryStrings = true
          }

          output.push(item)
        }
      }
      return [output, hasPrimaryStrings]
    } else {
      return [['ID', 'Name', 'Icon', 'Url'], strings.includes('Name')]
    }
  }

  private language(request: Request) {
    const language = request.query.language
    if (!language || language === MAIN_LANGUAGE || !LANGUAGES.includes(language)) {
      return null
    }

    return language
  }
  /* Request param extractors ends */

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
