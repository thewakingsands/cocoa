import { SheetFormatterFactory } from './interface'

export const instanceContentFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'InstanceContent') {
    return null
  }

  // This does not appear to be working

  // For example:
  // https://xivapi.com/InstanceContent/1
  // https://xivapi.com/InstanceContent/43

  return (row) => {
    row.ContentFinderCondition = null
    row.ContentMemberType = null
    row.ContentType = null
    row.Icon = null
    row.Banner = null
    row.Description = null
    row.Description_chs = null
    row.Description_en = null
    row.Description_ja = null
    row.Description_de = null
    row.Description_fr = null
  }
}
