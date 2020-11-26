import {isObject} from 'lodash'
import HLRU from 'hashlru'

const lru = HLRU(1000)

export function isExpanded(keyPath: any, value: any): any {
  const cached = lru.get(keyPath)

  if (cached === undefined) {
    lru.set(keyPath, Array.isArray(value) || isObject(value))
    return isExpanded(keyPath, value)
  }

  return cached
}

export function toggleExpanded(event: any): void {
  const {path} = event
  const current = lru.get(path)

  if (current === undefined) {
    // something is wrong
    return
  }

  lru.set(path, !current)
}

export function selectElement(element: HTMLElement): void {
  const sel = window.getSelection()

  if (sel) {
    const range = document.createRange()

    sel.removeAllRanges()
    range.selectNodeContents(element)
    sel.addRange(range)
  }
}

export function select(event: any): void {
  selectElement(event.currentTarget)
}

export function maybeSelectAll(event: any): void {
  const selectAll = event.keyCode === 65 && (event.metaKey || event.ctrlKey)

  if (!selectAll) {
    return
  }

  event.preventDefault()

  selectElement(event.currentTarget)
}
