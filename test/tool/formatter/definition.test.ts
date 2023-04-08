import { Row } from '../../../tools/lib/interface'
import { definitionFormatter, LINKS } from '../../../tools/lib/sheet/formatter/definition'

describe('test/tool/formatter/definition.test.ts', () => {
  it('should add link properties', () => {
    const formatter = definitionFormatter('Map')
    expect(formatter).not.toBeNull()

    const row: Row = {
      ID: 12,
      PlaceName: 29,
      PlaceNameRegion: 22,
      PlaceNameSub: 0,
      TerritoryType: 129,
    }
    formatter!(row)

    expect(row).toMatchObject({
      ID: 12,
      PlaceName: {
        ID: 29,
      },
      PlaceNameRegion: {
        ID: 22,
      },
      PlaceNameRegionTarget: 'PlaceName',
      PlaceNameRegionTargetID: 22,
      PlaceNameSub: null,
      PlaceNameSubTarget: 'PlaceName',
      PlaceNameSubTargetID: 0,
      PlaceNameTarget: 'PlaceName',
      PlaceNameTargetID: 29,
      TerritoryType: {
        ID: 129,
      },
      TerritoryTypeTarget: 'TerritoryType',
      TerritoryTypeTargetID: 129,
    })

    expect(row[LINKS]).toEqual([
      {
        force: true,
        id: 22,
        key: 'PlaceNameRegion',
        target: 'PlaceName',
      },
      {
        force: true,
        id: 29,
        key: 'PlaceName',
        target: 'PlaceName',
      },
      {
        force: true,
        id: 129,
        key: 'TerritoryType',
        target: 'TerritoryType',
      },
    ])
  })

  it('should handle multiref', () => {
    const formatter = definitionFormatter('RetainerTask')
    expect(formatter).not.toBeNull()

    const row1: Row = { Task: 1 }
    formatter!(row1)
    expect(row1).toMatchObject({
      Task: {
        ID: 1,
      },
      TaskTarget: 'RetainerTaskNormal',
      TaskTargetID: 1,
    })
    expect(row1[LINKS]).toEqual([
      {
        id: 1,
        key: 'Task',
        target: 'RetainerTaskNormal',
      },
    ])

    const row2: Row = { Task: 30001 }
    formatter!(row2)
    expect(row2).toMatchObject({
      Task: {
        ID: 30001,
      },
      TaskTarget: 'RetainerTaskRandom',
      TaskTargetID: 30001,
    })
    expect(row2[LINKS]).toEqual([
      {
        id: 30001,
        key: 'Task',
        target: 'RetainerTaskRandom',
      },
    ])
  })
})
