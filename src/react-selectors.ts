import { react16Selector as r16s } from './react-16/get-react'

export const react16Selector = r16s

export const getReactSelector = (roots: Node[]) => (selector: string) => {
  react16Selector(roots, selector)
}
