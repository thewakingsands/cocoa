import { MultiBar, Presets } from 'cli-progress'
import { readJson } from 'fs-extra'
import { dataPath } from '../lib/path'
import Redis from 'ioredis'
import LRUCache from 'lru-cache'
import { isLinkInvalid, Link, ResolvedLink } from '../lib/link'
import { keys } from '../lib/key'

export async function populate(redis: Redis, force = false) {
  const definitionList: string[] = await readJson(dataPath('definitions/_list.json'))

  // init progress bar
  const multibar = new MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '[{bar}] {percentage}% | {duration}s | {value}/{total} | {label}'
  }, Presets.shades_grey)

  // id list & link list
  const idListMap: Map<string, Set<string>> = new Map()
  const linkCache: LRUCache<string, Link[] | null> = new LRUCache({
    maxSize: 128 * 1024 * 1024,
    sizeCalculation: (a) => JSON.stringify(a).length
  })

  const getLink = async (def: string, id: string): Promise<Link[] | null> => {
    const key = keys.tempDirectLink(def, id)
    const cached = linkCache.get(key)
    if (cached !== undefined) {
      return cached
    }

    const text = await redis.get(key)
    if (text) {
      try {
        const data = JSON.parse(text)
        linkCache.set(key, data)
        return data
      } catch (e) { /* noop */ }
    }

    linkCache.set(key, null)
    return null
  }

  let pipeline = redis.pipeline()
  const flush = async () => {
    if (pipeline.length === 0) return
    await pipeline.exec()

    pipeline = redis.pipeline()
  }

  const populateDepth = 3
  /**
   * 
   * @param path Key path
   * @param resolved Output Array
   * @param def Definition Name
   * @param id Row ID
   * @returns Whether (def, id) is a valid row
   */
  const populateLink = async (path: string[], resolved: ResolvedLink[], def: string, id: string) => {
    const links = await getLink(def, id)
    if (!links) return false

    const depth = path.length + 1
    if (depth < populateDepth) {
      const isRoot = depth === 1
      for (const link of links) {
        const linkPath = [...path, link.key]
        const valid = !isLinkInvalid(def, id, link) && await populateLink(linkPath, resolved, link.target, link.id!)

        resolved.push({
          path: linkPath,
          target: link.target,
          id: link.id,
          null: valid !== true
        })

        // record reverse link
        if (valid && isRoot) {
          const key = keys.tempReverseLink(link.target, link.id!)
          const rev: Link = {
            key: link.key,
            target: def,
            id,
          }
          pipeline.lpush(key, JSON.stringify(rev))
        }
      }
    }

    return true
  }

  // load id lists
  const idBar = multibar.create(definitionList.length, 0, {
    label: 'Loading list'
  })
  for (const definitionName of definitionList) {
    idBar.increment()

    const list = await redis.lrange(keys.list(definitionName), 0, -1)
    idListMap.set(definitionName, new Set(list))
  }
  idBar.stop()

  // processing
  const mainBar = multibar.create(definitionList.length, 0, {
    label: 'Populating (Total)'
  })
  for (const definitionName of definitionList) {
    mainBar.increment()
    const finishKey = keys.populated(definitionName)
    if (!force && await redis.get(finishKey)) {
      continue
    }

    const ids = idListMap.get(definitionName)
    if (!ids) {
      multibar.log(`Error[${definitionName}]: Missing list\n`)
      continue
    }

    const bar = multibar.create(ids.size, 0, {
      label: `Populating ${definitionName}`
    })

    try {
      for (const id of ids) {
        bar.increment()

        const resolved: ResolvedLink[] = []
        await populateLink([], resolved, definitionName, id)

        pipeline
          .set(keys.fullLink(definitionName, id), JSON.stringify(resolved))

        if (pipeline.length > 500) {
          await flush()
        }
      }
    } catch (e: any) {
      multibar.log(`${e.name as string}[${definitionName}]: ${e.message as string}\n`)
    }

    pipeline.set(finishKey, '1')
    multibar.remove(bar)
  }

  await flush()
  multibar.stop()
}
