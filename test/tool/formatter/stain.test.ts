import { Row } from '../../../tools/lib/interface'
import { stainFormatter } from '../../../tools/lib/sheet/formatter/stain'

describe('test/tool/formatter/stain.test.ts', () => {
  it('should append Hex', () => {
    const formatter = stainFormatter('Stain')
    expect(formatter).not.toBeNull()

    const row: Row = { Color: 14999504 }
    formatter!(row)

    expect(row.Hex).toEqual('e4dfd0')
  })
})
