import { AnyValue, Row } from '../../interface'

type ExtendFunction = (value: AnyValue, key: string, row: Row) => any

export class Extended {
  private store = new Map<string, Array<{ keys: string[]; value: ExtendFunction | AnyValue }>>()

  public on(id: string) {
    const key = `${id}`

    let row = this.store.get(key)
    if (!row) {
      row = []
      this.store.set(key, row)
    }

    return (k: string | string[], v: ExtendFunction | AnyValue) => {
      row!.push({
        keys: Array.isArray(k) ? k : [k],
        value: v,
      })
    }
  }

  public apply(row: Record<string, any>) {
    const extend = this.store.get(`${row.ID as number}`)
    if (!extend) {
      return
    }

    for (const { keys, value } of extend) {
      const key = keys.find((item) => typeof row[item] === 'undefined')
      if (!key) continue

      if (typeof value === 'function') {
        row[key] = value(row[key], key, row)
      } else {
        row[key] = value
      }
    }
  }
}
