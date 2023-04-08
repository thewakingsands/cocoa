import { parse } from 'csv-parse'
import { readFile } from 'fs-extra'
import { getRealColumnNames } from '../../helper'
import { MAIN_LANGUAGE, TRANSIENT_TABLES } from '../../common/constant'
import { csvPath, formatSheetRow, isMultiLanguage, sortObject } from './util'
import { rowIndexes, subLanguages } from './common'
import { simpleReadSheet } from './simple'
import { SheetFormatter } from '../formatter/interface'
import { formatters } from '../formatter'
import { Extended } from '../helper/extended'
import { Row } from '../../interface'

export class Sheet {
  private multiLanguage: boolean
  private mainSheetPath: string

  // Extended columns for main sheet
  private extended = new Extended()

  private formatter: SheetFormatter[] = []

  public constructor(private name: string) {
    this.multiLanguage = isMultiLanguage(this.name)
    this.mainSheetPath = csvPath(this.name, this.multiLanguage ? MAIN_LANGUAGE : undefined)

    for (const factory of formatters) {
      const formatter = factory(name)
      if (formatter) {
        this.formatter.push(formatter)
      }
    }
    this.formatter.push((row) => this.extended.apply(row))
  }

  public async init() {
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
    row: Row
  }> {
    const file = await readFile(this.mainSheetPath, 'utf-8')
    let columns: string[] = []
    let types: string[] = []
    let stringColumns: string[] | undefined
    let row = 0

    const buffer: Row[] = []
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

        for (const formatter of this.formatter) {
          formatter(obj)
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
      for (const { row, types } of simpleReadSheet(this.name, lang)) {
        const extend = this.extended.on(row.ID as string)
        for (const column in row) {
          if (types[column] === 'str') {
            extend(`${column}_${lang}`, row[column])
          }
        }
      }
    }
  }

  private async loadTransient() {
    const sheet = new Sheet(`${this.name}Transient`)
    await sheet.init()

    for await (const { row } of sheet.iterator()) {
      const extend = this.extended.on(row.ID as string)
      for (const [key, value] of Object.entries(row)) {
        if (['ID', 'Url', 'Icon', 'Patch'].includes(key)) {
          continue
        }

        extend([key, `Transient${key}`], value)
      }
    }
  }
}

export async function getSheet(name: string) {
  const sheet = new Sheet(name)
  await sheet.init()

  return sheet
}
