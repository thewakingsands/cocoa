export const keys = {
  list: (def: string) => `meta.${def}.list`,
  scanned: (def: string) => `meta.${def}.scanned`,
  populated: (def: string) => `meta.${def}.populated`,
  data: (def: string, id: string) => `data.${def}.${id}`,
  tempDirectLink: (def: string, id: string) => `temp.${def}.direct.${id}`,
  fullLink: (def: string, id: string) => `meta.${def}.full.${id}`,
  tempReverseLink: (def: string, id: string) => `temp.${def}.reverse.${id}`,
  reverseLink: (def: string, id: string) => `meta.${def}.reverse.${id}`,
}