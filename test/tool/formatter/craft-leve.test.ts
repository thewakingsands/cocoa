import { Row } from '../../../tools/lib/interface'
import { craftLeveFormatter } from '../../../tools/lib/sheet/formatter/craft-leve'

describe('test/tool/formatter/craft-leve.test.ts', () => {
  it('should append leve data', async () => {
    const formatter = craftLeveFormatter('CraftLeve')
    expect(formatter).not.toBeNull()

    const row: Row = { ID: 918516, Item0TargetID: 27958 }
    formatter!(row)

    expect(row).toMatchObject({
      ID: 918516,
      Item0Recipes: [
        {
          CraftType: {
            ID: 6,
          },
          CraftTypeTarget: 'CraftType',
          CraftTypeTargetID: 6,
          ID: 3874,
          ItemIngredient0: {
            ID: 27782,
          },
          ItemIngredient0Target: 'Item',
          ItemIngredient0TargetID: 27782,
        },
      ],
      Item0TargetID: 27958,
      Item1Recipes: [],
      Item2Recipes: [],
      Item3Recipes: [],
    })
  })
})
