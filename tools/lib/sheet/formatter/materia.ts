import { Extended } from '../helper/extended'
import { simpleReadSheet } from '../reader/simple'
import { SheetFormatterFactory } from './interface'

export const materiaFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'Item') {
    return null
  }

  const extended = new Extended()
  for (const { row } of simpleReadSheet('Materia')) {
    const id = row.ID
    if (!id) continue

    for (let i = 0; i < 10; ++i) {
      const item = row[`Item${i}`] as string
      const value = row[`Value${i}`] as string

      if (item && item !== '0') {
        extended.on(item)('Materia', {
          ID: id,
          BaseParam: { ID: row.BaseParam },
          Value: value,
        })
      }
    }
  }

  return (row) => {
    extended.apply(row)
  }
}
