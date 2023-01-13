import { Input, Link } from '@geist-ui/core'
import { FormEvent, useEffect, useReducer } from 'react'
import { provider, tryGetAddress } from '../utils'

interface ReducerState {
  value: string
  ENSName?: string
}

interface SET_VALUE {
  type: 'SET_VALUE'
  value: string
}

interface ENS_NAME_FOUND {
  type: 'ENS_NAME_FOUND'
  name: string
}

function reducer(
  _: ReducerState,
  action: SET_VALUE | ENS_NAME_FOUND
): ReducerState {
  switch (action.type) {
    case 'SET_VALUE': {
      return { value: action.value }
    }
    case 'ENS_NAME_FOUND': {
      return { value: action.name, ENSName: action.name }
    }
  }
}

export function AddressInput({
  label,
  parentAddress,
  setParentAddress,
}: {
  label: string
  parentAddress: string | undefined
  setParentAddress: (address: string | undefined) => void
}) {
  const [{ value, ENSName }, dispatch] = useReducer(reducer, {
    value: parentAddress ?? '',
  })

  // ensure that typed addresses propagate,
  // and that typed addresses have their ENS looked up,
  // and that parentAddresses have their ENS looked up
  useEffect(() => {
    const address = tryGetAddress(value.length === 0 ? parentAddress : value)
    if (address) {
      if (address !== parentAddress) setParentAddress(address)
      let stale = false
      provider
        .lookupAddress(address)
        .then((ENSName) => {
          if (!stale && ENSName)
            dispatch({ type: 'ENS_NAME_FOUND', name: ENSName })
        })
        .catch(() => {})
      return () => {
        stale = true
      }
    }
  }, [value, parentAddress, setParentAddress])

  // ensure that typed ENS names propagate
  useEffect(() => {
    let stale = false
    provider
      .resolveName(value)
      .then((address) => {
        if (!stale && address) {
          if (address !== parentAddress) setParentAddress(address)
          dispatch({ type: 'ENS_NAME_FOUND', name: value })
        }
      })
      .catch(() => {})
    return () => {
      stale = true
    }
  }, [value, parentAddress, setParentAddress])

  function handler(event: FormEvent<HTMLInputElement>) {
    const value = event.currentTarget.value
    if (value === '') setParentAddress(undefined)
    const address = tryGetAddress(value)
    dispatch({ type: 'SET_VALUE', value: address ?? value })
  }

  const displayValue = ENSName ?? value.length > 0 ? value : parentAddress ?? ''
  const displayAddress = tryGetAddress(displayValue)

  const Icon =
    ENSName || displayAddress ? (
      <Link
        href={`https://etherscan.io/address/${ENSName ?? displayAddress}`}
        icon
        color
        target="_blank"
      />
    ) : null

  return (
    <Input
      label={label}
      placeholder="0x..."
      size={42}
      maxLength={42}
      width="100%"
      style={{ fontFamily: 'monospace' }}
      spellCheck={false}
      value={displayValue}
      onChange={handler}
      iconRight={Icon}
      iconClickable={true}
    />
  )
}
