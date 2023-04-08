import { readJsonSync } from 'fs-extra'
import { dataPath } from '../../common/path'
import { getRealColumnName } from '../../helper'
import { Data, Definition } from '../../interface'
import { isLinkInvalid, Link } from '../../link'
import { readIdList } from '../../pre-scan/id-list'
import { SheetFormatterFactory } from './interface'

export const LINKS = Symbol('Links')
export const EXTERNAL = Symbol('External')
export const definitionFormatter: SheetFormatterFactory = (def) => {
  let definition: Definition
  try {
    definition = readJsonSync(dataPath(`definitions/${def}.json`))
  } catch (e) {
    return null
  }

  const sheet = definition.sheet
  return (row) => {
    const links: Link[] = []
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
          // Notice: link type will set params even if target is invalid. So skip link target checking
          links.push({
            key,
            target: converter.target,
            id: row[key] ?? null,
            force: true,
          })
        }

        // handle multiref type definition
        if (converter.type === 'multiref') {
          // We don't have to link for TopicSelect because it'll break data
          if (sheet === 'TopicSelect') {
            return
          }

          const linkId = row[key] ?? null
          for (const linkTarget of converter.targets) {
            const link: Link = {
              key,
              target: linkTarget,
              id: linkId,
            }

            if (isLinkInvalid(sheet, row.ID, link)) {
              continue
            }

            const idList = readIdList(linkTarget)
            if (!idList.includes(String(linkId))) {
              continue
            }

            links.push(link)
          }
        }

        // handle complexlink type definition
        if (converter.type === 'complexlink') {
          // id of linked data
          const linkId = row[key] ?? null

          // possible targets
          const link = converter.links.find((item) => {
            if (!item.sheet) {
              return false
            }

            if (!item.when) {
              return true
            }

            const { key, value } = item.when
            if (typeof value === 'number') {
              return value === +row[key]!
            } else {
              return value === row[key]
            }
          })

          if (link) {
            links.push({
              key,
              target: link.sheet!,
              id: linkId,
              force: true,
            })
          }
        }

        // skip otherwise since they are already handled by reader or parent
      }
    }

    for (const data of definition.definitions) {
      handle(data)
    }

    row[LINKS] = []
    row[EXTERNAL] = new Set<string>()
    for (const link of links) {
      const invalid = isLinkInvalid(def, row.ID, link)
      const { key, target, id, force } = link

      row[EXTERNAL].add(key)
      if (invalid && !force) {
        continue
      }

      row[`${key}Target`] = target
      row[`${key}TargetID`] = id
      row[key] = invalid ? null : { ID: id }

      if (!invalid) {
        row[LINKS].push(link)
      }
    }
  }
}
