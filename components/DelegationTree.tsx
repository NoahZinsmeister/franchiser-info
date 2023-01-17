import { formatEther } from '@ethersproject/units'
import { Loading, Text } from '@geist-ui/core'
import { useEffect, useState } from 'react'
import { getAllDelegations } from '../utils'
import Tree from './tree'

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
      <Tree.Folder
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
            const Component = hasChildren ? Tree.Folder : Tree.File
            return (
              <Component
                key={`${i}${j}`}
                name={column.delegatee}
                extra={`${
                  column.votes.isZero() ? '0' : formatEther(column.votes)
                } votes`}
              />
            )
          })
        })}
      </Tree.Folder>
    </Tree>
  )
}
