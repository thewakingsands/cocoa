import { ZERO_CONTENT } from "./constant"

export interface Link {
  key: string
  target: string
  id: string | number | null
  force?: boolean
}

export interface ResolvedLink extends Omit<Link, 'key' | 'force'> {
  path: string[]
  null?: boolean
}

export const isSelfLink = (sheet: string, id: string | number, link: Link) => {
  return sheet === link.target && id === link.id
}

export const isLinkInvalid = (sheet: string, id: string | number, link: Link) => {
  return link.id === null
    || (link.id === '0' || link.id === 0 && !ZERO_CONTENT.includes(link.target))
    || isSelfLink(sheet, id, link)
}