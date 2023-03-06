import { Service } from 'typedi'
import { Request, RequestService } from './request'

export interface Stat {
  count: number
  strings: string[]
  externals: string[]
}

interface MainLanguageParams {
  main: string
  columns: string[]
}

interface FormatParams {
  enabled: boolean
  columns?: string[]
  populate?: string[]
  language?: MainLanguageParams
}

export type Row = Record<string, any> | null | undefined

@Service()
export class DataFormatService {
  public constructor(private request: RequestService) {}

  public getFormatParams(request: Request, stat: Stat, defaultAllColumns = false): FormatParams {
    if (this.request.deprecatedBool(request, 'no_post_process')) {
      return { enabled: false }
    }

    const [columns, hasPrimaryStrings] = this.request.columns(request, stat.strings, defaultAllColumns)
    const language = hasPrimaryStrings && this.request.language(request)
    const populate = this.getPopulate(columns, stat)

    return {
      enabled: columns !== undefined || !!language,
      populate,
      columns,
      language: language
        ? {
            main: language,
            columns: stat.strings,
          }
        : undefined,
    }
  }

  public processArray(rows: Row[], params: FormatParams) {
    return rows.map((row) => this.processItem(row, params))
  }

  public processItem(row: Row, { columns, language }: FormatParams) {
    if (!row) {
      return null
    }

    if (language) {
      this.handleMainLanguage(row, language)
    }

    if (columns) {
      return this.extract(row, columns)
    }

    return row
  }

  private getPopulate(columns: string[] | undefined, stat: Stat): string[] | undefined {
    if (columns === undefined) {
      return stat.externals
    }

    const picked = new Set<string>()
    for (const item of columns) {
      const pos = item.indexOf('.')
      const key = pos === -1 ? item : item.slice(0, pos)

      if (stat.externals.includes(key)) {
        picked.add(key)
      }
    }

    if (picked.size) {
      return Array.from(picked)
    } else {
      return undefined
    }
  }

  /**
   * Change primary string to selected language
   * @param row Row
   * @param strings Columns which are string
   * @param language Selected language
   */
  private handleMainLanguage(row: Record<string, any>, { columns, main }: MainLanguageParams) {
    for (const key of columns) {
      row[key] = row[`${key}_${main}`]
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
}
