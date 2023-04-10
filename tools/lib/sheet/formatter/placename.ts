import { Extended } from '../helper/extended'
import { simpleReadSheet } from '../reader/simple'
import { definitionFormatter } from './definition'
import { SheetFormatterFactory } from './interface'

export const placeNameFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'PlaceName') {
    return null
  }

  const extended = new Extended()
  const columns = ['PlaceName', 'PlaceNameRegion', 'PlaceNameSub']
  const mapFormatter = definitionFormatter('Map')!
  for (const { row } of simpleReadSheet('Map')) {
    mapFormatter(row)
    for (const column of columns) {
      const id = row[`${column}TargetID`]
      if (!id) continue

      extended.on(id as string)('Maps', (val: any[] | undefined) => [...(val || []), row])
    }
  }

  return (row) => {
    extended.apply(row)
  }
}
