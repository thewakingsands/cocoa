import { Row } from '../../../tools/lib/interface'
import { materiaFormatter } from '../../../tools/lib/sheet/formatter/materia'

describe('test/tool/formatter/materia.test.ts', () => {
  it('should append Materia to Item', () => {
    const formatter = materiaFormatter('Item')
    expect(formatter).not.toBeNull()

    const row: Row = { ID: 33938 }
    formatter!(row)

    expect(row.Materia).toEqual({
      BaseParam: {
        ID: 70,
      },
      ID: 21,
      Value: 27,
    })
  })
})
