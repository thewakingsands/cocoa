export type SheetFormatter = (row: Record<string | symbol, any>) => void
export type SheetFormatterFactory = (def: string) => SheetFormatter | null
