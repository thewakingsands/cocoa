import { join } from 'path'

export function dataPath(dir: string) {
  return join(__dirname, '../../data', dir)
}
