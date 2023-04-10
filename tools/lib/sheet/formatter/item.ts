import { simpleReadSheet } from '../reader/simple'
import { SheetFormatterFactory } from './interface'

interface Bonus {
  ID: number
  Max?: number
  MaxHQ?: number
  Relative: boolean
  Value?: number
  ValueHQ?: number
}

// This is actually 5, but we set it a little larger
const MAX_BASE_PARAMS = 10

export const itemFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'Item') {
    return null
  }

  const baseParams = new Map<number, string>()
  for (const { row } of simpleReadSheet('BaseParam', 'en')) {
    baseParams.set(row.ID as number, (row.Name as string).replaceAll(' ', ''))
  }

  // itemAction to itemFood map
  const itemActions = new Map<number, number>()
  const foodIds = new Set<number>()
  const bonusActions = [844, 845, 846]
  for (const { row } of simpleReadSheet('ItemAction')) {
    if (bonusActions.includes(row.Type as number)) {
      itemActions.set(row.ID as number, row.Data1 as number)
      foodIds.add(row.Data1 as number)
    }
  }

  // https://cafemaker.wakingsands.com/Item/4700?columns=Bonuses,ItemAction
  const itemFoods = new Map<number, Record<string, Bonus>>()
  for (const { row } of simpleReadSheet('ItemFood')) {
    if (!foodIds.has(row.ID as number)) continue

    const bonuses: Record<string, Bonus> = {}

    for (let i = 0; i < 3; i++) {
      // row is not processed with formatter (links are not resolved).
      // So here we don't need 'TargetID' suffix.
      const baseParamId = row[`BaseParam${i}`] as number
      if (baseParamId === 0) continue

      const name = baseParams.get(baseParamId)
      if (!name) continue

      const relative = row[`IsRelative${i}`] === 1
      const entry: Bonus = {
        ID: baseParamId,
        Relative: relative,
      }

      const value = row[`Value${i}`] as number
      if (value > 0) {
        entry.Value = value
        entry.ValueHQ = row[`ValueHQ${i}`] as number

        if (relative) {
          entry.Max = row[`Max${i}`] as number
          entry.MaxHQ = row[`MaxHQ${i}`] as number
        }
      }

      bonuses[name] = entry
    }

    itemFoods.set(row.ID as number, bonuses)
  }

  return (row) => {
    row.Materia = row.Materia || null
    row.Stats = null
    row.Bonuses = null

    for (let i = 0; i < MAX_BASE_PARAMS; ++i) {
      const baseParamId = row[`BaseParam${i}TargetID`]
      if (baseParamId === 0) continue

      const name = baseParams.get(baseParamId)
      if (!name) continue

      const entry: {
        ID: number
        NQ: number
        HQ?: number
      } = {
        ID: baseParamId,
        NQ: row[`BaseParamValue${i}`],
      }

      if (row.CanBeHq === 1) {
        entry.HQ = entry.NQ
        for (let j = 0; j < MAX_BASE_PARAMS; ++j) {
          const specialParamId = row[`BaseParamSpecial${j}TargetID`]
          if (specialParamId === baseParamId) {
            const bonusValue = row[`BaseParamValueSpecial${j}`]
            if (typeof bonusValue === 'number' && !isNaN(bonusValue)) {
              entry.HQ += bonusValue
            }
            break
          }
        }
      }

      row.Stats = {
        ...row.Stats,
        [name]: entry,
      }
    }

    const foodId = itemActions.get(row.ItemActionTargetID)
    if (foodId) {
      const bonuses = itemFoods.get(foodId)
      row.Bonuses = bonuses || {}
    }
  }
}
