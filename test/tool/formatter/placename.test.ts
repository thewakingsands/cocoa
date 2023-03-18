import { placeNameFormatter } from '../../../tools/lib/sheet/formatter/placename'
import { getXivapiData } from '../../service/fixtures/provider'

describe('test/tool/formatter/placename.test.ts', () => {
  it('should append Maps', async () => {
    const formatter = placeNameFormatter('PlaceName')
    expect(formatter).not.toBeNull()

    const row = { ID: 29 }
    formatter!(row)

    const placename29 = await getXivapiData('PlaceName', 29)
    expect(row).toMatchObject({
      ID: 29,
      Maps: placename29.Maps,
    })
  })
})
