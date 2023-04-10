import { orchestrionFormatter } from '../../../tools/lib/sheet/formatter/orchestrion'

describe('test/tool/formatter/orchestrion.test.ts', () => {
  it('should append OrchestrionUiparam', () => {
    const formatter = orchestrionFormatter('Orchestrion')
    expect(formatter).not.toBeNull()

    const row = { ID: 1 }
    formatter!(row)

    expect((row as any).OrchestrionUiparam).toMatchObject({
      ID: 1,
      OrchestrionCategory: {
        ID: 6,
      },
      OrchestrionCategoryTarget: 'OrchestrionCategory',
      OrchestrionCategoryTargetID: 6,
      Order: 2,
    })
  })
})
