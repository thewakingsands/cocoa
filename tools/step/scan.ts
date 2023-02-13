import { MultiBar, Presets } from 'cli-progress'
import { readJson } from 'fs-extra'
import { dataPath } from '../lib/path'
import Redis from 'ioredis'
import { Definition } from '../lib/interface'
import { readSheet } from '../lib/sheet'
import { ZERO_CONTENT } from '../lib/constant'
import { buildContent } from '../lib/builder'
import { keys } from '../../src/utils/key'
import { iterateDefinitions, loadDefinitionList } from '../lib/iterator'
import { Link } from '../lib/link'

async function readDefinition(name: string): Promise<Definition> {
  return readJson(dataPath(`definitions/${name}.json`))
}

interface AnalyzeResult {
  strings: string[]
  externals: string[]
}

function analyzeColumns(links: Link[], stringColumns: string[]): AnalyzeResult {
  return {
    strings: stringColumns,
    externals: links.map((link) => link.key),
  }
}

export async function initialScan(redis: Redis, force = false) {
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

  const definitions = await loadDefinitionList()
  await redis.set(keys.definitions, JSON.stringify(definitions))

  // start building
  await iterateDefinitions(multibar, 'Initial Scan (Total)', async (name) => {
    const listKey = keys.list(name)
    const finishKey = keys.scanned(name)
    if (!force && (await redis.get(finishKey))) {
      return
    }

    const bar = multibar.create(0, 0, {
      label: `Scanning ${name}`,
    })

    const definition = await readDefinition(name)

    pipeline.del(listKey)

    let analyzeResult = null
    let count = 0

    try {
      for (const { stringColumns, total, current, row } of readSheet(definition.sheet)) {
        // set total at first record
        if (current === 0) {
          bar.setTotal(total)
        }

        bar.increment()

        const id: number = +row.ID
        // skip 'zero' row if not specified
        if (id === 0 && !ZERO_CONTENT.includes(name)) {
          continue
        }

        const { links, data } = buildContent(definition, row)

        if (analyzeResult === null) {
          analyzeResult = analyzeColumns(links, stringColumns)
        }

        ++count
        pipeline
          .rpush(listKey, id)
          .set(keys.data(name, id), JSON.stringify(data))
          .set(keys.tempDirectLink(name, id), JSON.stringify(links))

        if (pipeline.length > 500) {
          await flush()
        }
      }
    } catch (e: any) {
      multibar.log(`${e.name as string}[${name}]: ${e.message as string}\n`)
    }

    pipeline.set(
      keys.stat(name),
      JSON.stringify({
        count,
        ...analyzeResult,
      }),
    )

    pipeline.set(finishKey, '1')
    multibar.remove(bar)
  })

  await flush()
  multibar.stop()
}
