import { Extended } from '../helper/extended'
import { simpleReadSheet } from '../reader/simple'
import { SheetFormatterFactory } from './interface'

export const placeNameFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'PlaceName') {
    return null
  }

  const extended = new Extended()
  const columns = ['PlaceName', 'PlaceNameRegion', 'PlaceNameSub']
  for (const { row } of simpleReadSheet('Map')) {
    for (const column of columns) {
      const id = row[column]
      if (!id) continue

      extended.on(id as string)('Maps', (val: any[] | undefined) => [...(val || []), row])
    }
  }

  return (row) => {
    extended.apply(row)
  }
}
