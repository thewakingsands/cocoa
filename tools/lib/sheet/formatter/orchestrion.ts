import { Extended } from '../helper/extended'
import { simpleReadSheet } from '../reader/simple'
import { definitionFormatter } from './definition'
import { SheetFormatterFactory } from './interface'

export const orchestrionFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'Orchestrion') {
    return null
  }

  const extended = new Extended()
  const uiparamFormatter = definitionFormatter('OrchestrionUiparam')!
  for (const { row } of simpleReadSheet('OrchestrionUiparam')) {
    const id = row.ID
    if (!id) continue

    uiparamFormatter(row)
    extended.on(id as string)('OrchestrionUiparam', row)
  }

  return (row) => {
    extended.apply(row)
  }
}
