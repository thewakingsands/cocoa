import { ensureFileSync, existsSync, readFileSync, writeFileSync } from 'fs-extra'
import { dataPath } from '../common/path'

export const idListPath = (name: string) => dataPath(`id-list/${name}.txt`)
export const idListExists = (name: string) => existsSync(idListPath(name))

const idListCache: Record<string, readonly string[]> = {}

export const readIdList = (name: string) => {
  if (idListCache[name]) {
    return idListCache[name]
  }

  const text = readFileSync(idListPath(name), 'utf-8')
  const data = text.trim().split('\n')

  idListCache[name] = data
  return data
}

export const writeIdList = (name: string, data: string[]) => {
  idListCache[name] = data

  const path = idListPath(name)
  ensureFileSync(path)
  writeFileSync(path, data.join('\n'))
}
