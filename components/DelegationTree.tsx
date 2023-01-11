import { formatEther } from '@ethersproject/units'
import { Text, Tree } from '@geist-ui/core'
import { useEffect, useState } from 'react'
import { getAllDelegations } from '../utils'

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

  console.log(delegations)

  return delegations === undefined ? null : delegations.length === 0 ? (
    <Text p>No delegations found.</Text>
  ) : (
    <Tree>
      {delegations.map((row, i) =>
        row.map((column, j) => {
          return (
            <Tree.File
              key={`${i}${j}`}
              name={column.delegatee}
              extra={`${formatEther(column.votes)} votes`}
            />
          )
        })
      )}
    </Tree>
  )
}
