import { Row } from '../../../tools/lib/interface'
import { worldFormatter } from '../../../tools/lib/sheet/formatter/world'

describe('test/tool/formatter/world.test.ts', () => {
  it('should append InGame = true', () => {
    const formatter = worldFormatter('World')
    expect(formatter).not.toBeNull()

    const row: Row = { ID: 1060 }
    formatter!(row)

    expect(row.InGame).toEqual(true)
  })

  it('should append InGame = false', () => {
    const formatter = worldFormatter('World')
    expect(formatter).not.toBeNull()

    const row: Row = { ID: 65535 }
    formatter!(row)

    expect(row.InGame).toEqual(false)
  })
})
