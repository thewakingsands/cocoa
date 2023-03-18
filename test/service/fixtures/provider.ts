import { existsSync, readJson, writeJson } from 'fs-extra'
import fetch from 'node-fetch'
import { join } from 'path'
import { AnyValue, Row } from '../../../tools/lib/interface'

function convertValue(v: AnyValue) {
  if (v && typeof v === 'object') {
    if (Array.isArray(v)) {
      return []
    } else if ('ID' in v) {
      return {
        ID: v.ID,
      }
    } else {
      return v
    }
  } else {
    return v
  }
}

function convertObject(data: AnyValue) {
  if (!data || typeof data !== 'object') {
    return data
  }

  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, convertValue(v)]))
}

function simplify(data: Row) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => {
      if (Array.isArray(v)) {
        return [k, v.map(convertObject)]
      }

      return [k, convertObject(v)]
    }),
  )
}

export async function getXivapiData(definition: string, id: string | number) {
  const path = join(__dirname, 'xivapi', `${definition.toLowerCase()}-${id}.json`)
  let data
  if (existsSync(path)) {
    data = await readJson(path)
  } else {
    const res = await fetch(`https://cafemaker.wakingsands.com/${definition}/${id}`)
    data = await res.json()

    await writeJson(path, data, { spaces: 2 })
  }

  return simplify(data)
}
