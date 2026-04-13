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
  const [menuOpen, setMenuOpen]     = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('roshi_name')
    if (!name) {
      router.replace('/onboarding')
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setPlayerName(name)
    setReady(true)
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) syncAll(user.id)
    })
  }, [router])

  // Close drawer on navigation
  // eslint-disable-next-line react-hooks/set-state-in-effect -- state sync on pathname change, no external system involved
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

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
            <button className={styles.hamburgerBtn} onClick={() => setMenuOpen(true)} aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6"  x2="19" y2="6" />
                <line x1="3" y1="11" x2="19" y2="11" />
                <line x1="3" y1="16" x2="19" y2="16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer overlay */}
      {menuOpen && (
        <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Slide-in drawer */}
      <div className={[styles.menuDrawer, menuOpen ? styles.menuDrawerOpen : ''].join(' ')} role="dialog" aria-label="Menu">
        <div className={styles.menuHeader}>
          <Avatar name={playerName} size={44} />
          <div className={styles.menuPlayerName}>{playerName}</div>
          <button className={styles.menuClose} onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          </button>
        </div>
        <nav className={styles.menuNav}>
          <Link href="/profile" className={styles.menuItem}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>
            Profile
          </Link>
          <Link href="/leaderboard" className={styles.menuItem}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="11" width="4" height="7" rx="1"/><rect x="8" y="7" width="4" height="11" rx="1"/><rect x="14" y="3" width="4" height="15" rx="1"/></svg>
            Leaderboard
          </Link>
          <Link href="/profile/starred" className={styles.menuItem}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="10 2 12.5 7.5 18.5 8.2 14.2 12.2 15.5 18 10 15 4.5 18 5.8 12.2 1.5 8.2 7.5 7.5 10 2"/></svg>
            Starred words
          </Link>
          <Link href="/profile/words" className={styles.menuItem}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"/><line x1="7" y1="8" x2="13" y2="8"/><line x1="7" y1="12" x2="11" y2="12"/></svg>
            Words learned
          </Link>
        </nav>
      </div>

      <main className={[styles.content, gameplay ? styles.contentGameplay : ''].filter(Boolean).join(' ')}>
        {children}
      </main>
    </div>
  )
}
