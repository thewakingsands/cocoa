import { MultiBar, Presets } from 'cli-progress'
import { readJson } from 'fs-extra'
import { dataPath } from '../lib/path'
import Redis from 'ioredis'
import { Definition } from '../lib/interface'
import { readSheet } from '../lib/sheet'
import { ZERO_CONTENT } from '../lib/constant'
import { buildContent } from '../lib/builder'
import { keys } from '../lib/key'

async function readDefinition(name: string): Promise<Definition> {
  return readJson(dataPath(`definitions/${name}.json`))
}

export async function initialScan(redis: Redis, force = false) {
  const definitionList: string[] = await readJson(dataPath('definitions/_list.json'))

  // init progress bar
  const multibar = new MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '[{bar}] {percentage}% | {duration}s | {value}/{total} | {label}'
  }, Presets.shades_grey)

  const definitionBar = multibar.create(definitionList.length, 0, {
    label: 'Initial Scan (Total)'
  })

  let pipeline = redis.pipeline()
  const flush = async () => {
    if (pipeline.length === 0) return
    await pipeline.exec()

    pipeline = redis.pipeline()
  }

  // start building
  for (const definitionName of definitionList) {
    definitionBar.increment()

    const listKey = keys.list(definitionName)
    const finishKey = keys.scanned(definitionName)
    if (!force && await redis.get(finishKey)) {
      continue
    }

    const bar = multibar.create(0, 0, {
      label: `Scanning ${definitionName}`
    })

    const definition = await readDefinition(definitionName)

    pipeline.del(listKey)

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

        pipeline
          .lpush(listKey, id)
          .set(keys.data(definitionName, id), JSON.stringify(data))
          .set(keys.tempDirectLink(definitionName, id), JSON.stringify(links))

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
