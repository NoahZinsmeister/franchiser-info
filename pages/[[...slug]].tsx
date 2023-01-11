import { Spacer, Text } from '@geist-ui/core'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { AddressInput } from '../components/AddressInput'
import { DelegationTree } from '../components/DelegationTree'
import styles from '../styles/Home.module.css'
import { tryGetAddress } from '../utils'

const ADDRESS_PLACEHOLDER = 'x'

export default function Home() {
  const router = useRouter()
  const [owner, delegatee]: (string | undefined)[] =
    typeof router.query.slug === 'string'
      ? [router.query.slug]
      : router.query.slug ?? []

  const setOwnerOrDelegatee = useCallback(
    (owner: string | undefined, delegatee: string | undefined) => {
      const ownerString =
        owner === undefined || owner === ADDRESS_PLACEHOLDER
          ? delegatee === undefined
            ? ''
            : `/${ADDRESS_PLACEHOLDER}`
          : `/${owner}`
      const delegateeString = delegatee ? `/${delegatee}` : ''
      router.push(`${ownerString}${delegateeString}`, undefined, {
        scroll: false,
        shallow: true,
      })
    },
    [router]
  )

  const setOwner = useCallback(
    (owner: string | undefined) => setOwnerOrDelegatee(owner, delegatee),
    [setOwnerOrDelegatee, delegatee]
  )

  const setDelegatee = useCallback(
    (delegatee: string | undefined) => setOwnerOrDelegatee(owner, delegatee),
    [setOwnerOrDelegatee, owner]
  )

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
            <Text h1 style={{ textAlign: 'center' }}>
              Franchiser
            </Text>
            <Spacer h={1} />
            <div>
              <AddressInput
                label={'Owner'}
                parentAddress={tryGetAddress(owner)}
                setParentAddress={setOwner}
              />
              <Spacer h={0.5} />
              <AddressInput
                label={'Delegatee'}
                parentAddress={tryGetAddress(delegatee)}
                setParentAddress={setDelegatee}
              />
            </div>
            <DelegationTree
              owner={tryGetAddress(owner)}
              delegatee={tryGetAddress(delegatee)}
            />
          </div>
        </div>
      </main>
    </>
  )
}
