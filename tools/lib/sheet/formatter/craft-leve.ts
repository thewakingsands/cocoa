import { Row } from '../../interface'
import { simpleReadSheet } from '../reader/simple'
import { definitionFormatter } from './definition'
import { SheetFormatterFactory } from './interface'

export const craftLeveFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'CraftLeve') {
    return null
  }

  const itemToRecipes: Record<string, Row[]> = {}
  const recipeFormatter = definitionFormatter('Recipe')!
  for (const { row } of simpleReadSheet('Recipe')) {
    const id = row.ID
    if (!id) continue

    recipeFormatter(row)
    const itemResult = row.ItemResultTargetID as string

    if (!itemToRecipes[itemResult]) {
      itemToRecipes[itemResult] = []
    }

    itemToRecipes[itemResult].push(row)
  }

  return (row) => {
    for (let i = 0; i < 4; ++i) {
      row[`Item${i}Recipes`] = itemToRecipes[row[`Item${i}TargetID`]] || []
    }
  }
}
