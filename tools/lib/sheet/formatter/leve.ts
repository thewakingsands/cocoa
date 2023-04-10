import { Link } from '../../link'
import { EXTERNAL, LINKS } from './definition'
import { SheetFormatterFactory } from './interface'

export const leveFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'Leve') {
    return null
  }

  const source = ['CraftLeve', 'CompanyLeve', 'GatheringLeve', 'BattleLeve']
  return (row) => {
    const external: Set<string> = row[EXTERNAL]
    external.delete('DataId')

    for (const item of source) {
      row[item] = null
      external.add(item)
    }

    const target: string = row.DataIdTarget
    row[target] = row.DataId
    row[`${target}TargetID`] = row.DataId.ID
    delete row.DataId

    for (const link of row[LINKS] as Link[]) {
      if (link.key === 'DataId') {
        link.key = target
      }
    }
  }
}
