import { readJsonSync } from 'fs-extra'
import { FOREIGN_REMOVALS, MAIN_LANGUAGE } from '../constant'
import { getImagePath, handleID } from '../helper'
import { dataPath } from '../path'

const removalRegex = new RegExp(FOREIGN_REMOVALS.join('|'), 'g')
function formatString(str: string) {
  return str.replace(/\r/g, '\n').replace(removalRegex, '')
}

export function applySheetColumn(obj: Record<string, any>, column: string, type: string, value: string) {
  if (!column) return

  const upperValue = value.toUpperCase()
  if (upperValue === 'TRUE') {
    obj[column] = 1
  } else if (upperValue === 'FALSE') {
    obj[column] = 0
  } else if (type === 'Image') {
    obj[column] = getImagePath(value)
    obj[`${column}ID`] = +value

    if (column === 'Icon') {
      obj[`${column}HD`] = getImagePath(value, true)
    }
  } else if (type === 'str') {
    const str = formatString(value)
    obj[column] = str
    obj[`${column}_${MAIN_LANGUAGE}`] = str
  } else if (column === 'ID') {
    obj[column] = handleID(value)
  } else if (!isNaN(+value)) {
    // convert to number if possible
    obj[column] = +value
  } else {
    obj[column] = value
  }
}

export function formatSheetRow(row: string[], columns: string[], types: string[]) {
  const obj: Record<string, any> = {}

  for (let j = 0; j < row.length; ++j) {
    applySheetColumn(obj, columns[j], types[j], row[j])
  }

  return obj
}

export function sortObject(obj: Record<string, any>) {
  const sortedObj: Record<string, any> = {}
  const sortedColumns = Object.keys(obj).sort()

  for (const key of sortedColumns) {
    sortedObj[key] = obj[key]
  }

  return sortedObj
}

const patches = readJsonSync(dataPath('xivapi/patchlist.json'))
export function applyPatchData(obj: Record<string, any>) {
  const id = obj.Patch
  if (!id) return

  const patch = patches.find((item: any) => item.ID === id)
  obj.GamePatch = patch || null
}
