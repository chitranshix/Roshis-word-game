'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './AppShell.module.css'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const [scrolled, setScrolled]     = useState(false)
  const [ready, setReady]           = useState(false)
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    const name = localStorage.getItem('roshi_name')
    if (!name) {
      router.replace('/onboarding')
      return
    }
    setPlayerName(name)
    setReady(true)
  }, [router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Don't render anything until name check resolves (prevents flash)
  if (!ready) return null

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  const initials    = playerName.slice(0, 2).toUpperCase()
  const isDark      = resolvedTheme === 'dark'

  return (
    <div className={styles.shell}>
      <header className={[styles.header, scrolled ? styles.scrolled : ''].join(' ')}>
        <span className={styles.logo}>Roshi</span>
        <div className={styles.headerRight}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to land (light)' : 'Switch to water (dark)'}
          >
            {isDark ? '🏔️' : '🌊'}
          </button>
          <div className={styles.avatar}>{initials}</div>
        </div>
      </header>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
}
