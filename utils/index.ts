import { getAddress } from '@ethersproject/address'
import type { BigNumber } from '@ethersproject/bignumber'
import type { ContractFunction } from '@ethersproject/contracts'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import {
  FRANCHISER_FACTORY_ABI,
  FRANCHISER_FACTORY_ADDRESS,
  FRANCHISER_LENS_ABI,
  FRANCHISER_LENS_ADDRESS,
} from './constants'

interface FranchiserLensContract extends Contract {
  functions: {
    'getAllDelegations(address,address)': ContractFunction<
      [[string, string, string, BigNumber][][]]
    >
  }
}

const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL, 1)

export const FranchiserFactory = new Contract(
  FRANCHISER_FACTORY_ADDRESS,
  FRANCHISER_FACTORY_ABI,
  provider
)

export const FranchiserLens = new Contract(
  FRANCHISER_LENS_ADDRESS,
  FRANCHISER_LENS_ABI,
  provider
) as FranchiserLensContract

interface DelegationWithVotes {
  delegator: string
  delegatee: string
  franchiser: string
  votes: BigNumber
}

export async function getAllDelegations(owner: string, delegatee: string) {
  return FranchiserLens.functions['getAllDelegations(address,address)'](
    owner,
    delegatee
  )
    .catch(() => [[]])
    .then(([delegations]) =>
      delegations.map((row) =>
        row.map(
          ([delegator, delegatee, franchiser, votes]): DelegationWithVotes => ({
            delegator,
            delegatee,
            franchiser,
            votes,
          })
        )
      )
    )
}

export function tryGetAddress(address: string | undefined): string | undefined {
  if (!address) return undefined
  try {
    return getAddress(address.toLowerCase())
  } catch {
    return undefined
  }
}
