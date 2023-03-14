import { parse } from 'csv-parse'
import { parse as parseSync } from 'csv-parse/sync'
import { existsSync, readFile, readFileSync, readJsonSync } from 'fs-extra'
import { getRealColumnNames } from './helper'
import { DESCRIPTION_JSON, LANGUAGES, MAIN_LANGUAGE, TRACKED_CONTENT, TRANSIENT_TABLES } from './constant'
import { dataPath } from './path'
import { applyPatchData, formatSheetRow, sortObject } from './formatter/sheet'
import { formatRowDescription } from './formatter/description'

const subLanguages = LANGUAGES.filter((item) => item !== MAIN_LANGUAGE)

function csvPath(filename: string, lang = '') {
  return dataPath(`datamining/${filename}${lang ? '.' : ''}${lang}.csv`)
}

function readCsvSync(filename: string, lang = ''): string[][] {
  const input = readFileSync(csvPath(filename, lang), 'utf-8')

  return parseSync(input, {
    skip_empty_lines: true,
  })
}

const rowIndexes = {
  name: 1,
  type: 2,
  start: 3,
}

export function* simpleReadSheet(name: string) {
  const mainSheet = readCsvSync(name)
  const columns = getRealColumnNames(name, mainSheet[rowIndexes.name])
  for (let i = rowIndexes.start; i < mainSheet.length; ++i) {
    const array = mainSheet[i]
    const obj: Record<string, any> = {}

    for (let j = 0; j < array.length; ++j) {
      obj[columns[j]] = array[j]
    }

    yield obj
  }
}

export class Sheet {
  private multiLanguage: boolean
  private mainSheetPath: string
  // Extended columns for main sheet
  private extended = new Map<string, Array<{ keys: string[]; value: any }>>()

  public constructor(private name: string) {
    this.multiLanguage = existsSync(csvPath(this.name, MAIN_LANGUAGE))
    this.mainSheetPath = csvPath(this.name, this.multiLanguage ? MAIN_LANGUAGE : undefined)
  }

  public async init() {
    this.loadPatchVersion()

    // load sub sheets if this is a multi-language sheet
    if (this.multiLanguage) {
      this.loadSubLanguages()
    }

    // load transient
    if (TRANSIENT_TABLES.includes(this.name)) {
      await this.loadTransient()
    }
  }

  public async *iterator(needTotal = false): AsyncGenerator<{
    stringColumns: string[]
    total: number | undefined
    current: number
    row: Record<string, any>
  }> {
    const file = await readFile(this.mainSheetPath, 'utf-8')
    let columns: string[] = []
    let types: string[] = []
    let stringColumns: string[] | undefined
    let row = 0

    const descRules = DESCRIPTION_JSON[this.name as keyof typeof DESCRIPTION_JSON]
    const buffer: Record<string, any>[] = []
    for await (const record of parse(file, {
      skip_empty_lines: true,
    })) {
      if (row === rowIndexes.name) {
        columns = getRealColumnNames(this.name, record)
      } else if (row === rowIndexes.type) {
        types = record
      } else if (row >= rowIndexes.start) {
        if (!stringColumns) {
          stringColumns = columns.filter((_, i) => types[i] === 'str')
        }

        let obj = formatSheetRow(record, columns, types)
        obj.Url = `/${this.name}/${obj.ID as number}`

        this.applyExtend(obj)
        applyPatchData(obj)

        if (descRules) {
          formatRowDescription(obj, descRules.true, descRules.false)
        }

        obj = sortObject(obj)

        if (needTotal) {
          buffer.push(obj)
        } else {
          yield {
            stringColumns,
            total: undefined,
            current: row - rowIndexes.start,
            row: obj,
          }
        }
      }

      ++row
    }

    if (needTotal) {
      for (let i = 0; i < buffer.length; ++i) {
        yield {
          stringColumns: stringColumns!,
          total: buffer.length,
          current: i,
          row: buffer[i],
        }
      }
    }
  }

  private loadSubLanguages() {
    for (const lang of subLanguages) {
      const sheet = readCsvSync(this.name, lang)
      const columns = getRealColumnNames(this.name, sheet[rowIndexes.name])
      const types = sheet[rowIndexes.type]

      for (let i = rowIndexes.start; i < sheet.length; ++i) {
        const id = sheet[i][0]
        const extend = this.extend(id)

        types.forEach((type, j) => {
          if (type === 'str') {
            extend(`${columns[j]}_${lang}`, sheet[i][j])
          }
        })
      }
    }
  }

  private loadPatchVersion() {
    const needGamePatchID = TRACKED_CONTENT.includes(this.name)
    let data: Record<string, number> = {}
    try {
      data = readJsonSync(dataPath(`patches/${this.name}.json`))
    } catch (e) {
      /* noop */
    }

    for (const [id, version] of Object.entries(data)) {
      if (typeof version !== 'number') continue

      const extend = this.extend(id)
      extend('Patch', version)

      if (needGamePatchID) {
        extend('GamePatchID', version)
      }
    }
  }

  private async loadTransient() {
    const sheet = new Sheet(`${this.name}Transient`)
    await sheet.init()

    for await (const { row } of sheet.iterator()) {
      const extend = this.extend(row.ID)
      for (const [key, value] of Object.entries(row)) {
        if (['ID', 'Url', 'Icon', 'Patch'].includes(key)) {
          continue
        }

        extend([key, `Transient${key}`], value)
      }
    }
  }

  private extend(id: string) {
    let row = this.extended.get(id.toString())
    if (!row) {
      row = []
      this.extended.set(id, row)
    }

    return (k: string | string[], v: any) => {
      row!.push({
        keys: Array.isArray(k) ? k : [k],
        value: v,
      })
    }
  }

  private applyExtend(row: Record<string, any>) {
    const extend = this.extended.get(row.ID.toString())
    if (!extend) {
      return
    }

    for (const { keys, value } of extend) {
      const key = keys.find((item) => typeof row[item] === 'undefined')
      if (!key) continue

      row[key] = value
    }
  }
}

export async function getSheet(name: string) {
  const sheet = new Sheet(name)
  await sheet.init()

  return sheet
}
