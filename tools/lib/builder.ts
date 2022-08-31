import { ZERO_CONTENT } from "./constant";
import { getRealColumnName } from "./helper";
import { Data, Definition } from "./interface";

export interface Link {
  key: string,
  target: string,
  id: string
}

export function buildContent(definition: Definition, data: Record<string, any>): {
  links: Link[],
  data: any
} {
  const sheet = definition.sheet
  const links: Link[] = []

  const isLinkInvalid = (linkTarget: string, linkId: string | null) => {
    return linkId === null
      || (linkId === '0' && !ZERO_CONTENT.includes(linkTarget))
      || (sheet === linkTarget && data.ID === linkId)
  }

  const handle = (rule: Data, suffix = '') => {
    if (rule.type === 'group') {
      // group data
      for (const def of rule.members) {
        handle(def, suffix)
      }
    } else if (rule.type === 'repeat') {
      // repeat data
      for (let i = 0; i < rule.count; ++i) {
        handle(rule.definition, `${i}${suffix}`)
      }
    } else {
      // single data
      const name = getRealColumnName(sheet, rule.name)
      const key = `${name}${suffix}`

      // special one because SE is crazy and link level_item id by the ACTUAL level...
      if (sheet === 'Item' && name === 'LevelItem') {
        return
      }

      const converter = rule.converter
      if (!converter) {
        return
      }

      // handle link type definition
      if (converter.type === 'link') {
        const linkId: string | null = data[key] ?? null;
        const linkTarget = converter.target;

        // Notice: link type will set params even if target is invalid. So skip link target checking
        // if (isLinkInvalid(linkTarget, linkId)) {
        //   return
        // }

        // save connection
        links.push({
          key,
          target: linkTarget,
          id: linkId!
        })
      }

      // handle multiref type definition
      if (converter.type === 'multiref') {
        // We don't have to link for TopicSelect because it'll break data
        if (sheet === 'TopicSelect') {
          return;
        }

        const linkId = data[key] ?? null;
        for (const linkTarget of converter.targets) {
          if (isLinkInvalid(linkTarget, linkId)) {
            continue
          }

          // Here we link all possible targets. The links will be filtered later.
          links.push({
            key,
            target: linkTarget,
            id: linkId
          })
        }
      }

      // handle complexlink type definition
      if (converter.type === 'complexlink') {
        // id of linked data
        const linkId = data[key] ?? null;

        // possible targets
        const link = converter.links.find(item => {
          if (!item.sheet) {
            return false
          }

          if (!item.when) {
            return true
          }

          const { key, value } = item.when
          if (typeof value === 'number') {
            return value === +data[key]
          } else {
            return value === data[key]
          }
        })

        if (link) {
          links.push({
            key,
            target: link.sheet!,
            id: linkId
          })
        }
      }

      // skip otherwise since they are already handled by reader or parent
    }
  }

  for (const data of definition.definitions) {
    handle(data)
  }

  return {
    links,
    data
  }
}