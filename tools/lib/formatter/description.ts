import { DESCRIPTION_COMPARE_FUNCTION, LANGUAGES, PLAYER_PARAMETER } from '../constant'
import { simpleReadSheet } from '../sheet'

let colors: Record<number, string> | null = null

function initColors() {
  colors = {}
  for (const row of simpleReadSheet('UIColor')) {
    // This is weird but seems correct
    const int = row.UIGlow
    // const int = row.UIForeground

    colors[row.ID] = parseInt(int).toString(16).padStart(8, '0').slice(0, 6)
  }
}
/**
 * Replace color entries with hex value and add SPAN placeholders
 */
function formatColors(input: string) {
  if (!colors) {
    initColors()
  }

  return (
    input
      // remove 73 because not sure what it is right now
      .replace(/<UIGlow>(.*?)<\/UIGlow>/gi, '')
      // replace 72 closing with a reset
      .replace(/<UIForeground>01<\/UIForeground>/gi, '</__Color>')
      // replace all colour entries with hex values
      .replace(/<UIForeground>(.*?)<\/UIForeground>/gi, (_, code: string) => {
        // we only care for last 2 bytes
        // convert hex to decimal
        const index = parseInt(code.slice(-4), 16)
        return `<__Color(${colors![index]})>`
      })
  )
}

interface Condition {
  condition: {
    left: string
    operator: string
    right: number
  }
  false: '' | Array<string | number | Condition>
  true: '' | Array<string | number | Condition>
}

/**
 * Formats the description into logic
 */
export function formatDescriptionLogic(input: string) {
  input = formatColors(input)

  const tags: Array<{
    tag: string
    arg?: string
    closing: 'self' | 'true' | 'false'
    left: number
    right: number
  }> = []

  const regex = /<(\/)?(\w+)(?:\(([^>]+)\))?(\/)?>/g
  let match
  while ((match = regex.exec(input))) {
    let ending: 'self' | 'true' | 'false' = 'false'
    if (match[1]) {
      ending = 'true'
    } else if (match[4]) {
      ending = 'self'
    }
    tags.push({
      tag: match[2],
      arg: match[3],
      closing: ending,
      left: match.index,
      right: match.index + match[0].length,
    })
  }

  if (tags.length === 0) {
    return [input]
  }

  const result: Array<string | Condition> = []
  const stack: Array<string | Condition>[] = []

  const formatList = (list: Array<string | number | Condition>) => {
    for (let i = 0; i < list.length; ++i) {
      const item = list[i]
      switch (typeof item) {
        case 'string':
          if (/^\d+$/.test(item)) {
            list[i] = +item
          }
          break
        case 'object':
          if (item.true.length === 0) {
            item.true = ''
          }
          if (item.false.length === 0) {
            item.false = ''
          }
          break
      }
    }
  }

  const pushItem = (item: string | Condition) => {
    const target = stack.length === 0 ? result : stack[stack.length - 1]
    if (typeof item === 'string' && target.length > 0 && typeof target[target.length - 1] === 'string') {
      target[target.length - 1] += item
    } else {
      target.push(item)
    }
  }

  const parseCondition = (arg: string) => {
    // GreaterThanOrEqualTo(PlayerParameter(68),16)
    let match = /^(\w+)\((\w+)\((\d+)\),(\d+)\)$/.exec(arg)
    if (match) {
      return {
        left: PLAYER_PARAMETER[match[3]],
        operator: DESCRIPTION_COMPARE_FUNCTION[match[1]],
        right: +match[4],
      }
    }

    // PlayerParameter(4)
    match = /^(\w+)\((\d+)\)$/.exec(arg)
    if (match) {
      return {
        left: PLAYER_PARAMETER[match[2]],
        operator: '==',
        right: 'true',
      }
    }

    throw new Error(`Failed parsing if condition: (${arg})`)
  }

  const pushCondition = (arg: string) => {
    const condition = {
      condition: parseCondition(arg),
      true: [],
      false: [],
    }

    pushItem(condition)
    stack.push(condition.true)
  }

  const endIf = () => {
    if (stack.length === 0) {
      throw new Error('Unexpected empty stack')
    }

    const list = stack.pop()
    formatList(list!)
  }

  const elseBranch = () => {
    endIf()

    const list = stack.length === 0 ? result : stack[stack.length - 1]
    const condition = list[list.length - 1]

    if (typeof condition === 'string') {
      throw new Error('Unexpected else w/o if')
    }

    stack.push(condition.false as any)
  }

  let pos = 0
  for (const tag of tags) {
    if (tag.left !== pos) {
      pushItem(input.slice(pos, tag.left))
    }

    switch (tag.tag) {
      case 'If':
        if (tag.closing === 'true') {
          endIf()
        } else if (tag.closing === 'false') {
          pushCondition(tag.arg!)
        } else {
          throw new Error('Unexpected self closing if')
        }
        break
      case 'Else':
        elseBranch()
        break
      case '__Color':
        if (tag.closing === 'true') {
          pushItem(`</span>`)
        } else {
          pushItem(`<span style="color:#${tag.arg!};">`)
        }
        break
    }

    pos = tag.right
  }

  if (pos !== input.length) {
    pushItem(input.slice(pos))
  }

  formatList(result)
  return result
}

export function formatDescription(input: string | Array<string | number | Condition>, condition: boolean): string {
  if (typeof input === 'string') {
    input = formatDescriptionLogic(input)
  }

  const result: Array<string | number> = []
  for (const item of input) {
    if (typeof item === 'object') {
      const branch = condition ? item.true : item.false
      if (typeof branch === 'string') {
        result.push(branch)
      } else {
        result.push(formatDescription(branch, condition))
      }
    } else {
      result.push(item)
    }
  }

  return result.join('')
}

const suffixes = ['', ...LANGUAGES.map((i) => `_${i}`)]
export function formatRowDescription(row: Record<string, any>, ruleTrue: string | null, ruleFalse: string | null) {
  for (const suffix of suffixes) {
    const source = row[`Description${suffix}`]
    if (typeof source === 'undefined') continue

    try {
      const logic = formatDescriptionLogic(source)
      row[`DescriptionJSON${suffix}`] = logic

      if (ruleTrue !== null) {
        row[`Description${ruleTrue}${suffix}`] = formatDescription(logic, true)
      }

      if (ruleFalse !== null) {
        row[`Description${ruleFalse}${suffix}`] = formatDescription(logic, false)
      }
    } catch (e) {
      throw new Error(`Error at [ID:${row.ID as string}] Description${suffix}`, { cause: e })
    }
  }
}
