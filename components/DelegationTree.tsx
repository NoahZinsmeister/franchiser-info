import { formatEther } from '@ethersproject/units'
import { Loading, Text, Tree } from '@geist-ui/core'
import { ComponentProps, useEffect, useState } from 'react'
import { getAllDelegations } from '../utils'
import { useENSName } from '../utils/hooks'

function TreeComponentWithENS({
  Component,
  name,
  ...rest
}: (ComponentProps<typeof Tree.Folder> | ComponentProps<typeof Tree.File>) & {
  Component: typeof Tree.Folder | typeof Tree.File
}) {
  const ENSName = useENSName(name)
  return <Component name={ENSName ?? name} {...rest} />
}

export function DelegationTree({
  owner,
  delegatee,
}: {
  owner: string | undefined
  delegatee: string | undefined
}) {
  const [delegations, setDelegations] = useState<
    undefined | Awaited<ReturnType<typeof getAllDelegations>>
  >(undefined)
  useEffect(() => {
    if (owner && delegatee) {
      let stale = false

      getAllDelegations(owner, delegatee).then((delegations) => {
        if (!stale) setDelegations(delegations)
      })

      return () => {
        stale = true
        setDelegations(undefined)
      }
    }
  }, [owner, delegatee])

  return owner === undefined || delegatee === undefined ? null : delegations ===
    undefined ? (
    <Loading />
  ) : delegations.length === 0 ? (
    <Text p>No delegations found.</Text>
  ) : (
    <Tree
      initialExpand={true}
      style={{
        overflow: 'scroll',
        maxWidth: 'fit-content',
      }}
    >
      <TreeComponentWithENS
        Component={Tree.Folder}
        name={delegations[0][0].delegatee}
        extra={`${
          delegations[0][0].votes.isZero()
            ? '0'
            : formatEther(delegations[0][0].votes)
        } votes`}
      >
        {delegations.slice(1).map((row, i) => {
          return row.map((column, j) => {
            const hasChildren = delegations[i + 2]?.some(
              (d) => d.delegator === column.delegatee
            )

            return (
              <TreeComponentWithENS
                Component={hasChildren ? Tree.Folder : Tree.File}
                key={`${i}${j}`}
                name={column.delegatee}
                extra={`${
                  column.votes.isZero() ? '0' : formatEther(column.votes)
                } votes`}
              />
            )
          })
        })}
      </TreeComponentWithENS>
    </Tree>
  )
}
