import { useEffect, useState } from 'react'
import { provider } from '.'

export function useENSName(address: string | undefined) {
  const [ENS, setENS] = useState<string | null>(null)
  useEffect(() => {
    if (address) {
      let stale = false
      provider
        .lookupAddress(address)
        .then((ENSName) => {
          if (!stale && ENSName) setENS(ENSName)
        })
        .catch()
      return () => {
        stale = true
        setENS(null)
      }
    }
  }, [address])
  return ENS
}
