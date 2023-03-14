import { MultiBar, Presets } from 'cli-progress'
import Redis from 'ioredis'
import LRUCache from 'lru-cache'
import { isLinkInvalid, Link, ResolvedLink } from '../lib/link'
import { keys } from '../../src/utils/key'
import { iterateDefinitions } from '../lib/iterator'
import { handleID } from '../lib/helper'

export async function populate(redis: Redis, force = false) {
  // init progress bar
  const multibar = new MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: '[{bar}] {percentage}% | {duration}s | {value}/{total} | {label}',
    },
    Presets.shades_grey,
  )

  // id list & link list
  const idListMap: Map<string, Set<string>> = new Map()
  const linkCache: LRUCache<string, Link[] | null> = new LRUCache({
    maxSize: 128 * 1024 * 1024,
    sizeCalculation: (a) => JSON.stringify(a).length,
  })

  const getLink = async (def: string, id: string | number): Promise<Link[] | null> => {
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
      } catch (e) {
        /* noop */
      }
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

  const populateDepth = 1
  /**
   * @param path Key path
   * @param resolved Output Array
   * @param def Definition Name
   * @param id Row ID
   * @returns Whether (def, id) is a valid row
   */
  const populateLink = async (path: string[], resolved: ResolvedLink[], def: string, id: string | number) => {
    const links = await getLink(def, id)
    if (!links) return false

    const depth = path.length
    if (depth < populateDepth) {
      const isRoot = depth === 0
      for (const link of links) {
        const linkPath = [...path, link.key]
        const valid = !isLinkInvalid(def, id, link) && (await populateLink(linkPath, resolved, link.target, link.id!))

        if (valid || link.force) {
          resolved.push({
            path: linkPath,
            target: link.target,
            id: link.id,
            null: !valid,
          })
        }

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

  async function iterateGameData(
    title: string,
    {
      handler,
      pre,
      post,
    }: {
      handler: (def: string, id: string) => Promise<void>
      pre?: (def: string) => Promise<boolean>
      post?: (def: string) => Promise<void>
    },
  ) {
    await iterateDefinitions(multibar, title, async (name) => {
      if (pre && (await pre(name)) === false) {
        return
      }

      const ids = idListMap.get(name)
      if (!ids) {
        multibar.log(`Error[${name}]: Missing list\n`)
        return
      }

      const bar = multibar.create(ids.size, 0, {
        label: `=> ${name}`,
      })

      try {
        for (const id of ids) {
          bar.increment()
          await handler(name, id)
        }
      } catch (e: any) {
        multibar.log(`${e.name as string}[${name}]: ${e.message as string}\n`)
      }

      if (post) {
        await post(name)
      }

      multibar.remove(bar)
    })
  }

  // load id lists
  await iterateDefinitions(multibar, 'Loading list', async (name) => {
    const list = await redis.lrange(keys.list(name), 0, -1)
    idListMap.set(name, new Set(list))
  })

  // clear reverse link
  await iterateGameData('Clearing reverse link data', {
    async handler(name, id) {
      pipeline.del(keys.tempReverseLink(name, id))
      if (pipeline.length > 500) {
        await flush()
      }
    },
  })

  // populating
  await iterateGameData('Populating', {
    async pre(name) {
      const finishKey = keys.populated(name)
      if (!force && (await redis.get(finishKey))) {
        return false
      }

      return true
    },
    async handler(name, id) {
      const resolved: ResolvedLink[] = []
      await populateLink([], resolved, name, id)

      pipeline.set(keys.fullLink(name, id), JSON.stringify(resolved))

      if (pipeline.length > 500) {
        await flush()
      }
    },
  })

  // force flush before processing reverse link
  await flush()

  // process reverse link
  await iterateGameData('Processing reverse link data', {
    async handler(name, id) {
      const tmpKey = keys.tempReverseLink(name, id)
      const data = await redis.lrange(tmpKey, 0, -1)
      const result: Record<string, Record<string, Array<string | number>>> = {}

      for (const item of data) {
        const link = JSON.parse(item) as Link

        if (!link.id) {
          continue
        }

        result[link.target] ??= {}
        result[link.target][link.key] ??= []
        result[link.target][link.key].push(handleID(link.id))
      }

      pipeline.set(keys.reverseLink(name, id), JSON.stringify(result)).del(tmpKey)

      if (pipeline.length > 500) {
        await flush()
      }
    },
  })

  await flush()
  multibar.stop()
}
