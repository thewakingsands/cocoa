import { COLUMN_NAMES } from './constant'

/**
 * Gets the real path to an image
 */
export function getImagePath(number: string, hd = false) {
  if (!number || number === '0') return null

  const icon = number.toString().padStart(6, '0')
  return `/i/${icon.substring(0, 3)}000/${icon}${hd ? '_hr1' : ''}.png`
}

/**
 * Fixes some column names so that everything is "Name" related
 */
export function getRealColumnNames(filename: string, columns: string[]) {
  return [
    // switch # to ID
    columns[0] === '#' ? 'ID' : columns[0],
    // switch some column names
    ...columns.slice(1).map((item) => getReplacedName(filename, getSimpleColumnName(item))),
  ]
}
export function getRealColumnName(filename: string, column: string) {
  return getReplacedName(filename, getSimpleColumnName(column))
}

/**
 * Get a simplified column name
 */
export function getSimpleColumnName(columns: string) {
  return columns.replace(/(?:^|[[\]{}<>() ])([a-z]?)/g, (_, chr: string) => (chr ? chr.toUpperCase() : ''))
}

/**
 * Get a replaced name
 */
export function getReplacedName(filename: string, column: string) {
  return COLUMN_NAMES[filename]?.[column] ?? column
}

export function handleID(id: string | number) {
  if (typeof id === 'number' || id.includes('.')) {
    return id
  }

  return +id
}
