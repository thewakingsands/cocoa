import { MultiBar, Presets } from 'cli-progress'
import Redis from 'ioredis'
import { Link } from '../lib/link'
import { keys } from '../../src/utils/key'
import { iterateDefinitions } from '../lib/iterator'
import { handleID } from '../lib/helper'
import { readIdList } from '../lib/pre-scan/id-list'
import { tryParseJson } from '../../src/utils/json'

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

  let pipeline = redis.pipeline()
  const flush = async () => {
    if (pipeline.length === 0) return
    await pipeline.exec()

    pipeline = redis.pipeline()
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

      const ids = readIdList(name)
      if (!ids) {
        multibar.log(`Error[${name}]: Missing list\n`)
        return
      }

      const bar = multibar.create(ids.length, 0, {
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
  await iterateGameData('Generating reverse link data', {
    async pre(name) {
      const finishKey = keys.populated(name)
      if (!force && (await redis.get(finishKey))) {
        return false
      }

      return true
    },
    async handler(name, id) {
      const key = keys.fullLink(name, id)
      const links = tryParseJson<Link[]>(await redis.get(key))

      if (!links) {
        return
      }

      // record reverse link
      for (const link of links) {
        const key = keys.tempReverseLink(link.target, link.id!)
        const rev: Link = {
          key: link.key,
          target: name,
          id,
        }
        pipeline.lpush(key, JSON.stringify(rev))
      }

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
