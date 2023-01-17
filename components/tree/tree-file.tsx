import { Avatar, useClasses, useTheme } from '@geist-ui/core'
import React, { useMemo } from 'react'
import { useENSAvatar, useENSName } from '../../utils/hooks'

import { useTreeContext } from './tree-context'
import { makeChildPath, stopPropagation } from './tree-help'
import TreeIndents from './tree-indents'

interface Props {
  selected?: boolean
  name: string
  extra?: string
  parentPath?: string
  level?: number
  className?: string
}

const defaultProps = {
  selected: false,
  level: 0,
  className: '',
  parentPath: '',
}

type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>
export type TreeFileProps = Props & NativeAttrs

// @ts-ignore
const TreeFile: React.FC<React.PropsWithChildren<TreeFileProps>> = ({
  selected,
  name: passedName,
  parentPath,
  level,
  extra,
  className,
  ...props
}: React.PropsWithChildren<TreeFileProps> & typeof defaultProps) => {
  const theme = useTheme()
  const { onFileClick } = useTreeContext()

  const ENSName = useENSName(passedName)
  const avatar = useENSAvatar(ENSName)
  const name = ENSName ?? passedName

  const currentPath = useMemo(
    () => makeChildPath(name, parentPath),
    [name, parentPath]
  )
  const clickHandler = (event: React.MouseEvent) => {
    stopPropagation(event)
    onFileClick && onFileClick(currentPath)
  }

  return (
    <div
      className={useClasses('file', className)}
      onClick={clickHandler}
      {...props}
    >
      <div className="names">
        <TreeIndents count={level} />
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
      <style jsx>{`
        .file {
          cursor: pointer;
          line-height: 1;
          user-select: none;
          margin-left: calc(1.875rem * ${level});
        }

        .names {
          display: flex;
          height: 1.75rem;
          align-items: center;
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

        .icon {
          height: 100%;
          display: inline-flex;
          align-items: center;
          margin-right: 0.5rem;
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
      `}</style>
    </div>
  )
}

TreeFile.defaultProps = defaultProps
TreeFile.displayName = 'GeistTreeFile'
export default TreeFile
