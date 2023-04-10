import { SheetFormatterFactory } from './interface'

export const stainFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'Stain') {
    return null
  }

  return (row) => {
    row.Hex = row.Color.toString(16).padStart(6, '0')
  }
}
