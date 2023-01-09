import { isAddress } from '@ethersproject/address'
import { Text } from '@geist-ui/core'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import { getAllDelegations } from '../utils'

export default function Home() {
  const router = useRouter()
  const [owner, delegatee]: (string | undefined)[] =
    typeof router.query.slug === 'string'
      ? [router.query.slug]
      : router.query.slug ?? []

  const [delegations, setDelegations] = useState<
    Awaited<ReturnType<typeof getAllDelegations>>
  >([])
  useEffect(() => {
    if (owner && isAddress(owner) && delegatee && isAddress(delegatee)) {
      let stale = false

      getAllDelegations(owner, delegatee).then((delegations) => {
        if (!stale) setDelegations(delegations)
      })

      return () => {
        stale = true
        setDelegations([])
      }
    }
  }, [owner, delegatee])

  console.log(delegations)

  return (
    <>
      <Head>
        <title>Franchiser</title>
        <meta name="description" content="A view-only Franchiser visualizer." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.center}>
          <div>
            <Text h1 mb={0}>
              Franchiser
            </Text>
            <Text p>This is a paragraph.</Text>
          </div>
        </div>
      </main>
    </>
  )
}
