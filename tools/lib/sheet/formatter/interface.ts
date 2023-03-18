export type SheetFormatter = (row: Record<string, any>) => void
export type SheetFormatterFactory = (def: string) => SheetFormatter | null
