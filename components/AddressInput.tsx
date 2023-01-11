import { Input } from '@geist-ui/core'
import { FormEvent, useEffect, useState } from 'react'
import { tryGetAddress } from '../utils'

export function AddressInput({
  label,
  parentAddress,
  setParentAddress,
}: {
  label: string
  parentAddress: string | undefined
  setParentAddress: (address: string | undefined) => void
}) {
  const [value, setValue] = useState(parentAddress ?? '')

  function handler(event: FormEvent<HTMLInputElement>) {
    const value = event.currentTarget.value
    if (value === '') setParentAddress(undefined)
    const address = tryGetAddress(value)
    setValue(address ?? value)
  }

  useEffect(() => {
    const address = tryGetAddress(value)
    if (address && address !== parentAddress) setParentAddress(address)
  }, [value, parentAddress, setParentAddress])

  return (
    <Input
      label={label}
      placeholder="0x..."
      size={42}
      maxLength={42}
      width={'100%'}
      style={{ fontFamily: 'monospace' }}
      spellCheck={false}
      value={value.length > 0 ? value : parentAddress ?? ''}
      onChange={handler}
    />
  )
}
