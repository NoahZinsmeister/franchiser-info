import { Avatar, useClasses, useTheme } from '@geist-ui/core'
import React, { useEffect, useMemo, useState } from 'react'
import { useENSAvatar, useENSName } from '../../utils/hooks'
import { setChildrenProps } from './collections'
import Expand from './expand'

import { useTreeContext } from './tree-context'
import TreeFile from './tree-file'
import { makeChildPath, sortChildren, stopPropagation } from './tree-help'
import TreeIndents from './tree-indents'
import TreeStatusIcon from './tree-status-icon'

interface Props {
  owner?: boolean
  delegatee?: boolean
  name: string
  extra?: string
  selected?: boolean
  parentPath?: string
  level?: number
  className?: string
}

const defaultProps = {
  owner: false,
  delegatee: false,
  selected: false,
  level: 0,
  className: '',
  parentPath: '',
}

type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>
export type TreeFolderProps = Props & NativeAttrs

// @ts-ignore
const TreeFolder: React.FC<React.PropsWithChildren<TreeFolderProps>> = ({
  owner,
  delegatee,
  selected,
  name: passedName,
  children,
  parentPath,
  level: parentLevel,
  extra,
  className,
  ...props
}: React.PropsWithChildren<TreeFolderProps> & typeof defaultProps) => {
  const theme = useTheme()
  const { initialExpand, isImperative } = useTreeContext()
  const [expanded, setExpanded] = useState<boolean>(initialExpand)
  useEffect(() => setExpanded(initialExpand), [initialExpand])

  const ENSName = useENSName(passedName)
  const avatar = useENSAvatar(ENSName)
  const name = ENSName ?? passedName

  const currentPath = useMemo(
    () => makeChildPath(name, parentPath),
    [name, parentPath]
  )
  const clickHandler = () => setExpanded(!expanded)

  const nextChildren = setChildrenProps(
    children,
    {
      parentPath: currentPath,
      level: parentLevel + 1,
    },
    [TreeFolder, TreeFile]
  )

  const sortedChildren = isImperative
    ? nextChildren
    : sortChildren(nextChildren, TreeFolder)

  return (
    <div className={useClasses('folder', className)} {...props}>
      <div className="names" style={owner ? { cursor: 'auto' } : undefined}>
        <TreeIndents count={parentLevel} />
        {!owner && (
          <span className="status" onClick={clickHandler}>
            <TreeStatusIcon active={expanded} />
          </span>
        )}
        {avatar && (
          <span className="icon">
            <Avatar src={avatar} />
          </span>
        )}
        <span className="name">
          <span
            style={{
              fontFamily: 'monospace',
              ...(selected ? { fontWeight: 'bold' } : undefined),
            }}
          >
            {name}
          </span>
          {extra && <span className="extra">{extra}</span>}
        </span>
      </div>
      <Expand isExpanded={expanded}>
        <div className="content" onClick={stopPropagation}>
          {sortedChildren}
        </div>
      </Expand>

      <style jsx>{`
        .folder {
          cursor: pointer;
          line-height: 1;
          user-select: none;
        }

        .names {
          display: flex;
          height: 1.75rem;
          align-items: center;
          margin-left: calc(1.875rem * ${parentLevel});
          position: relative;
        }

        .names > :global(.indent) {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 100%;
          background-color: ${theme.palette.accents_2};
          margin-left: -1px;
        }

        .status {
          cursor: pointer;
          position: absolute;
          left: calc(-1.125rem);
          top: 50%;
          transform: translate(-50%, -50%);
          width: 2rem;
          height: 2rem;
          z-index: 10;
          background-color: ${theme.palette.background};
        }

        .icon {
          height: 100%;
          margin-right: 0.5rem;
        }

        .status,
        .icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .name {
          transition: opacity 100ms ease 0ms;
          color: ${theme.palette.accents_8};
          white-space: nowrap;
          font-size: 0.875rem;
        }

        .extra {
          font-size: 0.75rem;
          align-self: baseline;
          padding-left: 4px;
          color: ${theme.palette.accents_5};
        }

        .content {
          display: flex;
          flex-direction: column;
          height: auto;
        }
      `}</style>
    </div>
  )
}

TreeFolder.defaultProps = defaultProps
TreeFolder.displayName = 'GeistTreeFolder'
export default TreeFolder
