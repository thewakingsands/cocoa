import { Row } from '../../../tools/lib/interface'
import { definitionFormatter } from '../../../tools/lib/sheet/formatter/definition'
import { itemFormatter } from '../../../tools/lib/sheet/formatter/item'

describe('test/tool/formatter/item.test.ts', () => {
  it('should append food bonuses', () => {
    const formatter = itemFormatter('Item')
    expect(formatter).not.toBeNull()

    const row: Row = { ID: 4700, ItemAction: 110 }
    definitionFormatter('Item')!(row)
    formatter!(row)

    expect(row.Bonuses).toEqual({
      SkillSpeed: {
        ID: 45,
        Max: 5,
        MaxHQ: 6,
        Relative: true,
        Value: 8,
        ValueHQ: 10,
      },
      Tenacity: {
        ID: 19,
        Max: 10,
        MaxHQ: 12,
        Relative: true,
        Value: 8,
        ValueHQ: 10,
      },
      Vitality: {
        ID: 3,
        Max: 6,
        MaxHQ: 7,
        Relative: true,
        Value: 8,
        ValueHQ: 10,
      },
    })
  })

  it('should append stats', () => {
    const formatter = itemFormatter('Item')
    expect(formatter).not.toBeNull()

    const row: Row = {
      ID: 6762,
      BaseParam0: 1,
      BaseParam1: 3,
      BaseParam2: 22,
      BaseParam3: 45,
      BaseParam4: 0,
      BaseParam5: 0,
      BaseParamModifier: 2,
      BaseParamSpecial0: 21,
      BaseParamSpecial1: 24,
      BaseParamSpecial2: 1,
      BaseParamSpecial3: 3,
      BaseParamSpecial4: 22,
      BaseParamSpecial5: 45,
      BaseParamValue0: 13,
      BaseParamValue1: 16,
      BaseParamValue2: 22,
      BaseParamValue3: 15,
      BaseParamValue4: 0,
      BaseParamValue5: 0,
      BaseParamValueSpecial0: 11,
      BaseParamValueSpecial1: 9,
      BaseParamValueSpecial2: 2,
      BaseParamValueSpecial3: 2,
      BaseParamValueSpecial4: 2,
      BaseParamValueSpecial5: 2,
      CanBeHq: 1,
    }
    definitionFormatter('Item')!(row)
    formatter!(row)

    expect(row.Stats).toEqual({
      DirectHitRate: {
        HQ: 24,
        ID: 22,
        NQ: 22,
      },
      SkillSpeed: {
        HQ: 17,
        ID: 45,
        NQ: 15,
      },
      Strength: {
        HQ: 15,
        ID: 1,
        NQ: 13,
      },
      Vitality: {
        HQ: 18,
        ID: 3,
        NQ: 16,
      },
    })
  })
})
