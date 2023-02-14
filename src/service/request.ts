import { Service } from 'typedi'
import { FastifyRequest } from 'fastify'
import { LANGUAGES, MAIN_LANGUAGE } from '../config/game'

export type Request = FastifyRequest<{
  Querystring: {
    max_items?: string
    limit?: string
    page?: string

    columns?: string
    columns_all?: string
    language?: string

    // deprecated queries
    no_post_process?: string

    // not implemented
    print_query?: string
    minify?: string
    pretty?: string
    snake_case?: string
    remove_keys?: string
  }
}>

@Service()
export class RequestService {
  public deprecatedBool(request: Request, key: keyof Request['query']) {
    const value = request.query[key]
    if (value) {
      // @todo: deprecate log
      return value !== '0' && value !== 'false'
    }

    return false
  }

  public limit(request: Request, defaultValue: number, maxValue: number) {
    const maxItems = parseInt(request.query.max_items ?? request.query.limit ?? '', 10)
    if (!maxItems || maxItems < 0) {
      return defaultValue
    }

    if (maxItems > maxValue) {
      return maxValue
    }

    return maxItems
  }

  public page(request: Request) {
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
   * @param defaultAll Return all columns if not specified
   * @returns [columns, hasPrimaryStrings]
   */
  public columns(request: Request, strings: string[], defaultAll = false): [undefined | string[], boolean] {
    if (request.query.columns_all) {
      return [undefined, true]
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

      output.sort()
      return [output, hasPrimaryStrings]
    } else if (defaultAll) {
      return [undefined, true]
    } else {
      return [['ID', 'Icon', 'Name', 'Url'], strings.includes('Name')]
    }
  }

  public language(request: Request) {
    const language = request.query.language
    if (!language || language === MAIN_LANGUAGE || !LANGUAGES.includes(language)) {
      return null
    }

    return language
  }
}
