import { unzip } from './unzip'
import fetch from 'node-fetch'
import { join, relative } from 'path'
import { existsSync, readFile, readFileSync } from 'fs-extra'
import { ResetMode, simpleGit } from 'simple-git'
import klaw from 'klaw'

export async function* githubZip(slug: string, ref = 'master') {
  const res = await fetch(`https://api.github.com/repos/${slug}/zipball/${ref}`)
  for await (const { entry, buffer } of unzip(await res.buffer())) {
    yield {
      path: entry.fileName,
      buffer,
    }
  }
}

export async function* githubClone(slug: string, ref = 'master', prefix?: string) {
  const cwd = join(__dirname, '../archive')
  const dir = slug.replace('/', '_')
  const repo = join(cwd, dir)

  if (existsSync(repo)) {
    const git = simpleGit(repo)
    await git.reset(ResetMode.HARD)
    await git.checkout(ref)
    await git.pull()
  } else if (prefix) {
    await simpleGit().clone(`https://github.com/${slug}.git`, repo, [
      '--single-branch',
      '-b',
      ref,
      '--depth=1',
      '--filter=blob:none',
      '--sparse',
    ])

    const git = simpleGit(repo, {
      spawnOptions: {},
    })
    await git.raw(['sparse-checkout', 'init', '--cone'])
    await git.raw(['sparse-checkout', 'add', prefix])
  } else {
    await simpleGit().clone(`https://github.com/${slug}.git`, repo, ['--single-branch', '-b', ref, '--depth=1'])
  }

  const root = prefix ? join(repo, prefix) : repo
  for await (const file of klaw(root)) {
    const relativePath = relative(root, file.path)
    console.log(relativePath)
    if (relativePath.startsWith('.git')) continue

    yield {
      path: relativePath,
      buffer: async () => readFile(file.path),
    }
  }
}

export interface GitTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  size?: number
  sha: string
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
        return res.buffer()
      },
    }
  }
}
