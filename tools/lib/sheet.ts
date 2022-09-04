import { parse } from 'csv-parse/sync'
import { readFileSync, readJsonSync } from 'fs-extra';
import { getImagePath, getRealColumnNames } from './helper';
import { FOREIGN_REMOVALS, LANGUAGES, MAIN_LANGUAGE } from './constant';
import { dataPath } from './path';

const removalRegex = new RegExp(FOREIGN_REMOVALS.join('|'), 'g');

const subLanguages = LANGUAGES.filter(item => item !== MAIN_LANGUAGE)

function readCsv(filename: string, lang = ''): string[][] {
  const input = readFileSync(dataPath(`datamining/${filename}${lang ? '.' : ''}${lang}.csv`), 'utf-8')

  return parse(input, {
    skip_empty_lines: true
  })
}

function formatString(str: string) {
  return str.replace(/\r/g, '\n').replace(removalRegex, '')
}

const rowIndexes = {
  name: 1,
  type: 2,
  start: 3,
}

export function* readSheet(name: string) {
  let loadSubLanguages = true
  let mainSheet: string[][]
  const extended: Map<string, Record<string, string>> = new Map()
  let patchData: Record<string, number> = {}
  try {
    patchData = readJsonSync(dataPath(`patches/${name}.json`))
  } catch (e) { /* noop */ }

  // load main sheet
  try {
    mainSheet = readCsv(name, MAIN_LANGUAGE)
  } catch (e) {
    loadSubLanguages = false
    mainSheet = readCsv(name)
  }

  const columns = getRealColumnNames(name, mainSheet[rowIndexes.name])
  const types = mainSheet[rowIndexes.type]

  // load sub sheets if required
  if (loadSubLanguages) {
    const stringIndexes = types.map((type, i) => type === 'str' ? i : -1).filter(i => i >= 0)
    for (const lang of subLanguages) {
      const sheet = readCsv(name, lang)

      for (let i = rowIndexes.start; i < sheet.length; ++i) {
        const id = sheet[i][0]
        let row = extended.get(id)
        if (!row) {
          row = {}
          extended.set(id, row)
        }

        for (const j of stringIndexes) {
          row[`${columns[j]}_${lang}`] = formatString(sheet[i][j])
        }
      }
    }
  }

  // processing
  for (let i = rowIndexes.start; i < mainSheet.length; ++i) {
    const array = mainSheet[i]
    const id = array[0]
    const obj: Record<string, any> = {}

    for (let j = 0; j < array.length; ++j) {
      const key = columns[j]
      if (!key) continue

      const type = types[j]
      const value = array[j]
      const upperValue = value.toUpperCase()
      if (upperValue === 'TRUE') {
        obj[key] = 1
      } else if (upperValue === 'FALSE') {
        obj[key] = 0
      } else if (type === 'Image') {
        obj[key] = getImagePath(value)
        obj[`${key}ID`] = value

        if (key === 'Icon') {
          obj[`${key}HD`] = getImagePath(value, true)
        }
      } else if (type === 'str') {
        obj[`${key}_${MAIN_LANGUAGE}`] = formatString(value)
      } else if (key === 'ID') {
        // convert to number if do not has dot
        obj[key] = value.includes('.') ? value : +value
      } else if (!isNaN(+value)) {
        // convert to number if possible
        obj[key] = +value
      } else {
        obj[key] = value
      }
    }

    if (loadSubLanguages) {
      Object.assign(obj, extended.get(id) || {})
    }

    const patch = patchData[id]
    if (typeof patch === 'number') {
      obj.Patch = patch
    }

    yield {
      total: mainSheet.length - rowIndexes.start,
      current: i - rowIndexes.start,
      row: obj
    }
  }
}
