import { Avatar, Input, Link } from '@geist-ui/core'
import { FormEvent, useEffect, useReducer } from 'react'
import { getENSName, provider, tryGetAddress } from '../utils'
import { useENSAvatar } from '../utils/hooks'

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
  address: string
  name: string
}

function reducer(
  state: ReducerState,
  action: SET_VALUE | ENS_NAME_FOUND
): ReducerState {
  switch (action.type) {
    case 'SET_VALUE': {
      if (state.value === action.value) return state
      return { value: action.value }
    }
    case 'ENS_NAME_FOUND': {
      return { value: action.address, ENSName: action.name }
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

  // console.log(value)
  // sync input state with parentAddress from the url
  useEffect(() => {
    dispatch({ type: 'SET_VALUE', value: parentAddress ?? '' })
  }, [parentAddress])

  // sync parentAddress with input state
  // useEffect(() => {
  //   if (value === '' && parentAddress) {
  //     setParentAddress(undefined)
  //   } else {
  //     const address = tryGetAddress(value)
  //     if (address && address !== parentAddress) setParentAddress(address)
  //   }
  // }, [value, parentAddress, setParentAddress])

  // sync input state with typed values
  function handler(event: FormEvent<HTMLInputElement>) {
    const value = event.currentTarget.value
    if (value === '') return setParentAddress(undefined)
    const address = tryGetAddress(value)
    if (address) return setParentAddress(address)
    dispatch({ type: 'SET_VALUE', value: value })
  }

  // ensure that addresses have their ENS looked up
  useEffect(() => {
    const address = tryGetAddress(value)
    if (address && !ENSName) {
      let stale = false
      getENSName(address)
        .then((ENSName) => {
          if (!stale && ENSName)
            dispatch({ type: 'ENS_NAME_FOUND', address, name: ENSName })
        })
        .catch()
      return () => {
        stale = true
      }
    }
  }, [value, ENSName])

  // ensure that typed ENS names propagate
  useEffect(() => {
    let stale = false
    if (value.includes('.')) {
      provider
        .resolveName(value)
        .then((resolvedAddress) => {
          if (!stale && resolvedAddress && resolvedAddress !== value) {
            setParentAddress(resolvedAddress)
            dispatch({
              type: 'ENS_NAME_FOUND',
              address: resolvedAddress,
              name: value,
            })
          }
        })
        .catch()
      return () => {
        stale = true
      }
    }
  }, [value, parentAddress, setParentAddress])

  const displayValue = ENSName ?? value
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

  const avatar = useENSAvatar(ENSName)

  return (
    <Input
      label={label}
      icon={
        avatar ? (
          <Avatar src={avatar} style={{ borderRadius: '100%' }} />
        ) : undefined
      }
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
