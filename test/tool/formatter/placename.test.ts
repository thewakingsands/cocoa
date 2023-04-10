import { Row } from '../../../tools/lib/interface'
import { placeNameFormatter } from '../../../tools/lib/sheet/formatter/placename'

describe('test/tool/formatter/placename.test.ts', () => {
  it('should append Maps to PlaceName', async () => {
    const formatter = placeNameFormatter('PlaceName')
    expect(formatter).not.toBeNull()

    const row: Row = { ID: 29 }
    formatter!(row)

    expect(row.Maps).toMatchObject([
      {
        DiscoveryArrayByte: 1,
        DiscoveryFlag: 0,
        Hierarchy: 1,
        ID: 12,
        IsEvent: 0,
        MapCondition: null,
        MapConditionTarget: 'MapCondition',
        MapConditionTargetID: 0,
        MapIndex: 0,
        MapMarkerRange: 72,
        OffsetX: 0,
        OffsetY: 0,
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
        PriorityCategoryUI: 1,
        PriorityUI: 3,
        SizeFactor: 200,
        TerritoryType: {
          ID: 129,
        },
        TerritoryTypeTarget: 'TerritoryType',
        TerritoryTypeTargetID: 129,
      },
    ])
  })
})
