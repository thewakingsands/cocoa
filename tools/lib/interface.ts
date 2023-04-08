export type AnyValue = string | number | boolean | null | undefined | any[] | Record<string, any>
export type Row = Record<string | symbol, AnyValue>

export interface ConverterBase {
  type: string
}

export interface ColorConverter {
  type: 'color'
}

export interface GenericReferenceConverter {
  type: 'generic'
}

export interface IconConverter {
  type: 'icon'
}

export interface MultiReferenceConverter {
  type: 'multiref'
  targets: string[]
}

export interface SheetLinkConverter {
  type: 'link'
  target: string
}

export interface TomestoneOrItemReferenceConverter {
  type: 'tomestone'
}

export interface ComplexLinkConverter {
  type: 'complexlink'
  links: Array<{
    sheet?: string
    sheets?: string[]
    project?: string
    key?: string
    when?: { key: string; value: string | number }
  }>
}

export type Converter =
  | ColorConverter
  | GenericReferenceConverter
  | IconConverter
  | MultiReferenceConverter
  | SheetLinkConverter
  | TomestoneOrItemReferenceConverter
  | ComplexLinkConverter

export interface DataBase {
  index?: number
}

export interface SingleData extends DataBase {
  type: null | undefined
  name: string
  converter?: Converter
}

export interface GroupData extends DataBase {
  type: 'group'
  members: Data[]
}

export interface RepeatData extends DataBase {
  type: 'repeat'
  count: number
  definition: Data
}

export type Data = SingleData | GroupData | RepeatData

export interface Definition {
  sheet: string
  defaultColumn: string
  isGenericReferenceTarget?: boolean
  definitions: Array<Data>
}
