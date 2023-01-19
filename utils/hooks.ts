import { useEffect, useState } from 'react'
import { getENSName, provider } from '.'

export function useENSName(address: string | undefined) {
  const [ENS, setENS] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (address) {
      let stale = false

      getENSName(address)
        .then((ENSName) => {
          if (!stale && ENSName) setENS(ENSName)
        })
        .catch()

      return () => {
        stale = true
        setENS(undefined)
      }
    }
  }, [address])
  return ENS
}

export function useENSAvatar(name: string | undefined) {
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (name) {
      let stale = false
      provider
        .getAvatar(name)
        .then((ENSAvatar) => {
          if (!stale && ENSAvatar) setAvatar(ENSAvatar)
        })
        .catch()
      return () => {
        stale = true
        setAvatar(undefined)
      }
    }
  }, [name])
  return avatar
}
