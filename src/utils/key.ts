export const keys = {
  definitions: 'const.definitions',
  list: (def: string) => `meta.${def}.list`,
  stat: (def: string) => `meta.${def}.stat`,
  scanned: (def: string) => `meta.${def}.scanned`,
  populated: (def: string) => `meta.${def}.populated`,
  data: (def: string, id: string | number) => `data.${def}.${id}`,
  tempDirectLink: (def: string, id: string | number) => `temp.${def}.direct.${id}`,
  fullLink: (def: string, id: string | number) => `meta.${def}.full.${id}`,
  tempReverseLink: (def: string, id: string | number) => `temp.${def}.reverse.${id}`,
  reverseLink: (def: string, id: string | number) => `meta.${def}.reverse.${id}`,
}