import { useClasses } from '@geist-ui/core'
import React, { useCallback, useMemo } from 'react'
import { tuple } from './prop-types'

import { TreeContext } from './tree-context'
import TreeFile from './tree-file'
import TreeFolder from './tree-folder'
import { sortChildren } from './tree-help'

const FileTreeValueType = tuple('directory', 'file')

const directoryType = FileTreeValueType[0]

export type TreeFile = {
  type: typeof FileTreeValueType[number]
  name: string
  extra?: string
  files?: Array<TreeFile>
}

interface Props {
  value?: Array<TreeFile>
  initialExpand?: boolean
  onClick?: (path: string) => void
  className?: string
}

const defaultProps = {
  initialExpand: false,
  className: '',
}

type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>
export type TreeProps = Props & NativeAttrs

const makeChildren = (value: Array<TreeFile> = []) => {
  if (!value || !value.length) return null
  return value
    .sort((a, b) => {
      if (a.type !== b.type) return a.type !== directoryType ? 1 : -1

      return `${a.name}`.charCodeAt(0) - `${b.name}`.charCodeAt(0)
    })
    .map((item, index) => {
      if (item.type === directoryType)
        return (
          <TreeFolder
            name={item.name}
            extra={item.extra}
            key={`folder-${item.name}-${index}`}
          >
            {makeChildren(item.files)}
          </TreeFolder>
        )
      return (
        <TreeFile
          name={item.name}
          extra={item.extra}
          key={`file-${item.name}-${index}`}
        />
      )
    })
}

// @ts-ignore
const Tree: React.FC<React.PropsWithChildren<TreeProps>> = ({
  children,
  onClick,
  initialExpand,
  value,
  className,
  ...props
}: React.PropsWithChildren<TreeProps> & typeof defaultProps) => {
  const isImperative = Boolean(value && value.length > 0)
  const onFileClick = useCallback(
    (path: string) => {
      onClick && onClick(path)
    },
    [onClick]
  )

  const initialValue = useMemo(
    () => ({
      onFileClick,
      initialExpand,
      isImperative,
    }),
    [onFileClick, initialExpand, isImperative]
  )

  const customChildren = isImperative
    ? makeChildren(value)
    : sortChildren(children, TreeFolder)

  return (
    <TreeContext.Provider value={initialValue}>
      <div className={useClasses('tree', className)} {...props}>
        {customChildren}
        <style jsx>{`
          .tree {
            padding-left: 1.625rem;
          }
        `}</style>
      </div>
    </TreeContext.Provider>
  )
}

Tree.defaultProps = defaultProps
Tree.displayName = 'GeistTree'
export default Tree
