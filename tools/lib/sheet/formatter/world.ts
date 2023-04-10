import { readJsonSync } from 'fs-extra'
import { dataPath } from '../../common/path'
import { SheetFormatterFactory } from './interface'

export const worldFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'World') {
    return null
  }

  const data = readJsonSync(dataPath('server-list/cn.json'))
  const store = new Set<number>()
  for (const { worlds } of data) {
    for (const { id } of worlds) {
      store.add(id)
    }
  }

  return (row) => {
    row.InGame = store.has(row.ID)
  }
}
