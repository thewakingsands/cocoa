import { Row } from '../../../tools/lib/interface'
import { definitionFormatter, EXTERNAL, LINKS } from '../../../tools/lib/sheet/formatter/definition'
import { leveFormatter } from '../../../tools/lib/sheet/formatter/leve'

describe('test/tool/formatter/leve.test.ts', () => {
  it('should append leve data', async () => {
    const formatter = leveFormatter('Leve')
    expect(formatter).not.toBeNull()

    const row: Row = { DataId: 918516 }
    definitionFormatter('Leve')!(row)
    formatter!(row)

    expect(row).toMatchObject({
      BattleLeve: null,
      CompanyLeve: null,
      CraftLeve: {
        ID: 918516,
      },
      CraftLeveTargetID: 918516,
      DataIdTarget: 'CraftLeve',
      DataIdTargetID: 918516,
      GatheringLeve: null,
    })
    expect(row[LINKS]).toEqual([
      {
        id: 918516,
        key: 'CraftLeve',
        target: 'CraftLeve',
      },
    ])

    const external: Set<string> = row[EXTERNAL] as any
    expect(external.has('BattleLeve')).toBeTruthy()
    expect(external.has('CompanyLeve')).toBeTruthy()
    expect(external.has('CraftLeve')).toBeTruthy()
    expect(external.has('GatheringLeve')).toBeTruthy()
    expect(external.has('DataId')).toBeFalsy()
  })
})
