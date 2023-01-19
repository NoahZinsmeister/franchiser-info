import { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'
import { Description, Link, Loading, Spacer, Text } from '@geist-ui/core'
import { useEffect, useState } from 'react'
import { getAllDelegations } from '../utils'
import Tree from './tree'

function recurseDown(
  delegation: Awaited<ReturnType<typeof getAllDelegations>>[0][0],
  delegations: Awaited<ReturnType<typeof getAllDelegations>>,
  votes: BigNumber = BigNumber.from(0)
): BigNumber {
  const rowIndex = delegations.findIndex((row) =>
    row.some((column) => column.franchiser === delegation.franchiser)
  )
  if (rowIndex + 1 == delegations.length) return votes
  const children = delegations[rowIndex + 1].filter((column) => {
    return column.delegator === delegation.delegatee
  })
  for (const child of children) {
    return votes.add(recurseDown(child, delegations, child.votes))
  }
  return votes
}

function sliceDelegations(
  delegations: Awaited<ReturnType<typeof getAllDelegations>> | undefined,
  selectedFranchiser: string | undefined
) {
  if (delegations === undefined || selectedFranchiser === undefined) {
    return { selectedDelegation: undefined, childrenVotes: undefined }
  }

  const rowIndexOfSelectedFranchiser = delegations.findIndex((row) =>
    row.some((column) => column.franchiser === selectedFranchiser)
  )

  const selectedDelegation = delegations[rowIndexOfSelectedFranchiser].find(
    (column) => column.franchiser === selectedFranchiser
  )!

  const childrenVotes = recurseDown(selectedDelegation, delegations)

  return { selectedDelegation, childrenVotes }
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
        if (!stale) {
          setDelegations(delegations)
          setSelectedFranchiser(delegations[0][0].franchiser)
        }
      })

      return () => {
        stale = true
        setDelegations(undefined)
        setSelectedFranchiser(undefined)
      }
    }
  }, [owner, delegatee])

  const [selectedFranchiser, setSelectedFranchiser] = useState<
    string | undefined
  >(undefined)

  const { selectedDelegation, childrenVotes } = sliceDelegations(
    delegations,
    selectedFranchiser
  )

  return owner === undefined || delegatee === undefined ? null : delegations ===
    undefined ? (
    <Loading />
  ) : delegations.length === 0 ? (
    <Text p>No delegations found.</Text>
  ) : (
    <>
      <Tree
        initialExpand={true}
        style={{
          overflow: 'scroll',
          maxWidth: 'fit-content',
          padding: 0,
        }}
      >
        <Tree.Folder
          name={delegations[0][0].delegator}
          owner={true}
          extra="Owner"
        >
          <Tree.Folder
            delegatee={true}
            extra="Delegatee"
            onClick={() => setSelectedFranchiser(delegations[0][0].franchiser)}
            selected={selectedFranchiser === delegations[0][0].franchiser}
            name={delegations[0][0].delegatee}
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
                    onClick={() => setSelectedFranchiser(column.franchiser)}
                    selected={selectedFranchiser === column.franchiser}
                    name={column.delegatee}
                  />
                )
              })
            })}
          </Tree.Folder>
        </Tree.Folder>
      </Tree>

      {selectedDelegation && (
        <>
          <Spacer h={2} />
          <Description
            title="Franchiser"
            content={
              <Link
                target="_blank"
                href={`https://etherscan.io/address/${selectedDelegation.franchiser}`}
                color
                style={{ fontFamily: 'monospace' }}
              >
                {selectedDelegation.franchiser}
              </Link>
            }
          />
          <Spacer h={1} />
          <Description
            title="Current Votes"
            content={`${
              selectedDelegation.votes.isZero()
                ? '0'
                : formatEther(selectedDelegation.votes)
            }`}
          />
          <Spacer h={1} />
          <Description
            title="Subdelegated Votes"
            content={`${
              childrenVotes.isZero() ? '0' : formatEther(childrenVotes)
            }`}
          />
        </>
      )}
    </>
  )
}
