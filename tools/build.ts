import { MultiBar, Presets } from 'cli-progress'
import { readJson } from 'fs-extra'
import { dataPath } from './lib/path'
import { config } from '../src/config/redis'
import Redis from 'ioredis'
import { Definition } from './lib/interface'
import { readSheet } from './lib/sheet'
import { ZERO_CONTENT } from './lib/constant'
import { buildContent } from './lib/builder'

async function readDefinition(name: string): Promise<Definition> {
  return readJson(dataPath(`definitions/${name}.json`))
}

export async function buildDataToRedis(force = false) {
  const definitionList: string[] = await readJson(dataPath('definitions/_list.json'))

  // init progress bar
  const multibar = new MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '[{bar}] {percentage}% | {duration}s | {value}/{total} | {label}'
  }, Presets.shades_grey)

  const definitionBar = multibar.create(definitionList.length * 2, 0, {
    label: 'Initial Scan (Total)'
  })

  // init redis
  const redis = new Redis(config)

  // start building
  for (const definitionName of definitionList) {
    definitionBar.increment()

    const listKey = `meta.${definitionName}.list`
    const finishKey = `meta.${definitionName}.scanned`
    if (!force && await redis.get(finishKey)) {
      continue
    }

    const definition = await readDefinition(definitionName)
    const bar = multibar.create(0, 0, {
      label: `Scan ${definitionName}`
    })

    await redis.del(listKey)

    try {
      for (const { total, current, row } of readSheet(definition.sheet)) {
        // set total at first record
        if (current === 0) {
          bar.setTotal(total)
        }

        bar.increment()

        const id: string = row.ID
        // skip 'zero' row if not specified
        if (id === '0' && !ZERO_CONTENT.includes(definitionName)) {
          continue
        }

        const { links, data } = buildContent(definition, row)

        await redis.pipeline()
          .lpush(listKey, id)
          .set(`data.${definitionName}.${id}`, JSON.stringify(data))
          .set(`meta.${definitionName}.direct.${id}`, JSON.stringify(links))
          .exec()
      }
    } catch (e: any) {
      multibar.log(`${e.name as string}[${definitionName}]: ${e.message as string}`)
    }

    await redis.set(finishKey, '1')
    multibar.remove(bar)
  }
}
