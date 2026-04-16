'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase'
import { syncAll } from '@/lib/sync'
import styles from './AppShell.module.css'

export default function AppShell({ children, gameplay }: { children: React.ReactNode, gameplay?: boolean }) {
  const router   = useRouter()
  const pathname = usePathname()
  const isHome   = pathname === '/'

  const [scrolled, setScrolled] = useState(false)
  const [ready, setReady]       = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('roshi_name')
    if (!name) {
      createClient().auth.getUser().then(({ data: { user } }) => {
        if (!user) { router.replace('/login'); return }
        createClient().from('users').select('name').eq('id', user.id).single()
          .then(({ data: profile }) => {
            const restoredName = profile?.name ?? ''
            if (!restoredName) { router.replace('/login'); return }
            localStorage.setItem('roshi_name', restoredName)
            // eslint-disable-next-line react-hooks/set-state-in-effect -- async auth callback
            setReady(true)
            syncAll(user.id)
          })
      })
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setReady(true)
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

  const activeTab =
    pathname === '/' ? 'home'
    : pathname.startsWith('/practice') || pathname === '/profile/words' ? 'practice'
    : pathname.startsWith('/dares') || pathname.startsWith('/dare') ? 'dares'
    : pathname.startsWith('/profile') || pathname.startsWith('/leaderboard') ? 'me'
    : ''

  return (
    <div className={styles.shell}>
      <header className={[styles.header, scrolled ? styles.scrolled : ''].join(' ')}>
        <div className={styles.headerInner}>
          {isHome ? (
            <Link href="/">
              <img src="/logo-light.png" alt="Roshi" className={`${styles.logo} ${styles.logoLight}`} />
              <img src="/logo-dark.png"  alt="Roshi" className={`${styles.logo} ${styles.logoDark}`} />
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
          </div>
        </div>
      </header>

      <main className={[styles.content, gameplay ? styles.contentGameplay : ''].filter(Boolean).join(' ')}>
        {children}
      </main>

      {!gameplay && (
        <nav className={styles.bottomNav} aria-label="Main navigation">
          <Link href="/" className={[styles.navItem, activeTab === 'home' ? styles.navActive : ''].join(' ')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.navLabel}>Home</span>
          </Link>

          <Link href="/practice" className={[styles.navItem, activeTab === 'practice' ? styles.navActive : ''].join(' ')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="9" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.9"/>
              <rect x="8" y="5" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.9"/>
            </svg>
            <span className={styles.navLabel}>Practice</span>
          </Link>

          <Link href="/dares" className={[styles.navItem, activeTab === 'dares' ? styles.navActive : ''].join(' ')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 2L4 13h7l-1 9 10-12h-7z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.navLabel}>Dares</span>
          </Link>

          <Link href="/profile" className={[styles.navItem, activeTab === 'me' ? styles.navActive : ''].join(' ')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.9"/>
              <path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
            </svg>
            <span className={styles.navLabel}>Me</span>
          </Link>
        </nav>
      )}
    </div>
  )
}
