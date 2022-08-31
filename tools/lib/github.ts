import { unzip } from './unzip'
import fetch from 'node-fetch'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'

export async function* githubZip(slug: string, ref = 'master') {
  const res = await fetch(`https://api.github.com/repos/${slug}/zipball/${ref}`)
  for await (const { entry, buffer } of unzip(await res.buffer())) {
    yield {
      path: entry.fileName,
      buffer,
    }
  }
}

export interface GitTreeItem {
  path: string,
  mode: string,
  type: 'blob' | 'tree',
  size?: number,
  sha: string,
  url: string
}

export async function* githubDirectory(slug: string, ref = 'master', prefix?: string) {
  const archiveName = `${slug} ${ref} ${prefix || ''}`.replace(/[/\\]/g, ' ').trim() + '.zip'
  const archivePath = join(__dirname, '../archive', archiveName)

  if (existsSync(archivePath)) {
    for await (const { entry, buffer } of unzip(readFileSync(archivePath))) {
      yield {
        path: entry.fileName,
        buffer,
      }
    }
    return
  }

  if (!prefix) {
    return githubZip(slug, ref)
  }

  const res = await fetch(`https://api.github.com/repos/${slug}/git/trees/${ref}?recursive=true`)
  const data = await res.json()

  if (!Array.isArray(data.tree)) {
    const url = `https://download-directory.github.io?url=https://github.com/${slug}/tree/${ref}/${prefix || ''}`
    throw new Error(`Git Tree api returned invalid response. Try download from ${url} and save to ${archivePath}`)
  }

  if (data.truncated) {
    throw new Error('Git Tree response is truncated, which is not supported')
  }

  if (!prefix.endsWith('/')) {
    prefix += '/'
  }

  for (const item of data.tree as GitTreeItem[]) {
    if (item.type !== 'blob' || !item.path.startsWith(prefix)) continue

    yield {
      path: item.path.slice(prefix.length),
      buffer: async () => {
        console.log(`Fetching ${item.path}`)
        const res = await fetch(item.url)
        return res.buffer();
      },
    };
  }
}