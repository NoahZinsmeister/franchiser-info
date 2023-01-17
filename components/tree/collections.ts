import React, { ReactNode } from 'react'

export const setChildrenProps = (
  children: ReactNode | undefined,
  props: Record<string, unknown>,
  targetComponents: Array<React.ElementType> = []
): ReactNode | undefined => {
  if (React.Children.count(children) === 0) return []
  const allowAll = targetComponents.length === 0
  const clone = (child: React.ReactElement, props = {}) =>
    React.cloneElement(child, props)

  return React.Children.map(children, (item) => {
    if (!React.isValidElement(item)) return item
    if (allowAll) return clone(item, props)

    const isAllowed = targetComponents.find((child) => child === item.type)
    if (isAllowed) return clone(item, props)
    return item
  })
}
