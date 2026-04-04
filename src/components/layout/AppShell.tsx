'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'
import styles from './AppShell.module.css'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('roshi_name')
    if (!name) {
      router.replace('/onboarding')
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setPlayerName(name)
    setReady(true)
  }, [router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!ready) return null
  const initials = playerName.slice(0, 2).toUpperCase()

  return (
    <div className={styles.shell}>
      <header className={[styles.header, scrolled ? styles.scrolled : ''].join(' ')}>
        <span className={styles.logo}>Roshi&apos;s Word Game</span>
        <div className={styles.headerRight}>
          <ThemeToggle />
          <div className={styles.avatar}>{initials}</div>
        </div>
      </header>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
}
