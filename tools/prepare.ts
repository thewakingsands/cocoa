import { basename, join } from 'path'
import { writeFile, ensureDir, remove } from 'fs-extra'
import { githubDirectory } from './lib/github'
import { existsSync } from 'fs'
import { dataPath } from './lib/path'

async function prepareDataDir(dir: string, clear = true) {
  const root = dataPath(dir)

  if (clear) {
    await remove(root)
  }
  await ensureDir(root)

  return root
}

export async function getSaintCoinachDefinitions() {
  const root = await prepareDataDir('definitions')
  const contents: string[] = []
  for await (const { path, buffer } of githubDirectory('xivapi/SaintCoinach', 'master', 'SaintCoinach/Definitions/')) {
    if (path.endsWith('.json')) {
      const contentName = basename(path, '.json')
      contents.push(contentName)

      await writeFile(join(root, `${contentName}.json`), await buffer())
    }
  }

  await writeFile(join(root, '_list.json'), JSON.stringify(contents, null, 2))
}

export async function getPatchData() {
  const root = await prepareDataDir('patches')
  const contents: string[] = []
  for await (const { path, buffer } of githubDirectory('xivapi/ffxiv-datamining-patches', 'master', 'patchdata/')) {
    if (path.endsWith('.json')) {
      const contentName = basename(path, '.json')
      contents.push(contentName)

      await writeFile(join(root, `${contentName}.json`), await buffer())
    }
  }

  await writeFile(join(root, '_list.json'), JSON.stringify(contents, null, 2))
}

export async function checkDatamining() {
  const root = await prepareDataDir('datamining', false)
  const testFiles = [
    'World.csv',
    'Item.chs.csv',
    'Item.en.csv',
    'Item.ja.csv'
  ]

  for (const file of testFiles) {
    const testPath = join(root, file)
    if (!existsSync(testPath)) {
      throw new Error(`'${testPath}' does not exists`)
    }
  }
}