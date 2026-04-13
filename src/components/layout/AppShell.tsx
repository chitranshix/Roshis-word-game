'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import { syncAll } from '@/lib/sync'
import styles from './AppShell.module.css'

export default function AppShell({ children, gameplay }: { children: React.ReactNode, gameplay?: boolean }) {
  const router   = useRouter()
  const pathname = usePathname()
  const isHome   = pathname === '/'

  const [scrolled, setScrolled]     = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [ready, setReady]           = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('roshi_name')
    if (!name) {
      router.replace('/onboarding')
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setPlayerName(name)
    setReady(true)
    // Sync Supabase → localStorage in background
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) syncAll(user.id)
    })
  }, [router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!ready) return null

  return (
    <div className={styles.shell}>
      <header className={[styles.header, scrolled ? styles.scrolled : ''].join(' ')}>
        <div className={styles.headerInner}>
          {isHome ? (
            <Link href="/">
              <img src="/logo-light.png" alt="Roshi's Word Game" className={`${styles.logo} ${styles.logoLight}`} />
              <img src="/logo-dark.png"  alt="Roshi's Word Game" className={`${styles.logo} ${styles.logoDark}`} />
            </Link>
          ) : (
            <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div className={styles.headerRight}>
            <ThemeToggle />
            <Link href="/profile" className={styles.avatarBtn} aria-label="Profile">
              <Avatar name={playerName} size={36} />
            </Link>
          </div>
        </div>
      </header>
      <main className={[styles.content, gameplay ? styles.contentGameplay : ''].filter(Boolean).join(' ')}>
        {children}
      </main>
    </div>
  )
}
