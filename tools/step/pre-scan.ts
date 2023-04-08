import { MultiBar, Presets } from 'cli-progress'
import { ZERO_CONTENT } from '../lib/common/constant'
import { iterateDefinitions } from '../lib/iterator'
import { idListExists, writeIdList } from '../lib/pre-scan/id-list'
import { simpleReadSheet } from '../lib/sheet/reader/simple'

export async function preScan(force = false) {
  // init progress bar
  const multibar = new MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: '[{bar}] {percentage}% | {duration}s | {value}/{total} | {label}',
    },
    Presets.shades_grey,
  )

  await iterateDefinitions(multibar, 'Generate ID List', async (name) => {
    if (!force && idListExists(name)) {
      return
    }

    try {
      const data: string[] = []
      for (const { row } of simpleReadSheet(name)) {
        if (row.ID === 0 && !ZERO_CONTENT.includes(name)) {
          continue
        }

        data.push(row.ID as string)
      }

      await writeIdList(name, data)
    } catch (e) {
      //
    }
  })

  multibar.stop()
}
