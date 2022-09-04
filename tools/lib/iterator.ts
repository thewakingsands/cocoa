import { MultiBar } from 'cli-progress'
import { readJson } from 'fs-extra'
import { dataPath } from '../lib/path'

const listCache = Symbol('def-list')
async function loadDefinitionList(): Promise<string[]> {
  const cached = (global as any)[listCache]
  if (cached) {
    return cached
  }

  const list: string[] = await readJson(dataPath('definitions/_list.json'))
    ; (global as any)[listCache] = list

  return list
}
export type DefinitionHandler<T = void> = (def: string) => Promise<T>
export type GameDataHandler<T = void> = (def: string, id: string) => Promise<T>

export async function iterateDefinitions(multibar: MultiBar, title: string, handler: DefinitionHandler) {
  const list = await loadDefinitionList()
  const bar = multibar.create(list.length, 0, {
    label: title
  })

  for (const name of list) {
    bar.increment()
    await handler(name)
  }
  bar.stop()
}
