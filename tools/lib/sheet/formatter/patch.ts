import { readJsonSync } from 'fs-extra'
import { TRACKED_CONTENT } from '../../common/constant'
import { dataPath } from '../../common/path'
import { SheetFormatterFactory } from './interface'

const patches = readJsonSync(dataPath('xivapi/patchlist.json'))
export const patchFormatter: SheetFormatterFactory = (def) => {
  const needGamePatchID = TRACKED_CONTENT.includes(def)
  let data: Record<string, number> = {}
  try {
    data = readJsonSync(dataPath(`patches/${def}.json`))
  } catch (e) {
    return null
  }

  return (row) => {
    const id = row.ID
    if (!id) return

    const version = data[id]
    if (typeof version !== 'number') return

    row.Patch = version
    if (needGamePatchID) {
      row.GamePatchID = version
    }

    const patch = patches.find((item: any) => item.ID === version)
    row.GamePatch = patch || null
  }
}
