import { parse as parseSync } from 'csv-parse/sync'
import { readFileSync } from 'fs-extra'
import { getRealColumnNames } from '../../helper'
import { rowIndexes } from './common'
import { Row } from '../../interface'
import { csvPath, formatSheetRow, isMultiLanguage } from './util'
import { MAIN_LANGUAGE } from '../../common/constant'

function readCsvSync(filename: string, lang = ''): string[][] {
  const input = readFileSync(csvPath(filename, lang), 'utf-8')

  return parseSync(input, {
    skip_empty_lines: true,
  })
}

export function* simpleReadSheet(name: string, lang = '') {
  if (!lang && isMultiLanguage(name)) {
    lang = MAIN_LANGUAGE
  }

  const sheet = readCsvSync(name, lang)
  const columns = getRealColumnNames(name, sheet[rowIndexes.name])
  const types = sheet[rowIndexes.type]
  const typeMap = Object.fromEntries(types.map((type, i) => [columns[i], type]))

  for (let i = rowIndexes.start; i < sheet.length; ++i) {
    const obj: Row = formatSheetRow(sheet[i], columns, types)
    yield { row: obj, types: typeMap }
  }
}
