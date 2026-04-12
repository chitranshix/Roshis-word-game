'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { getStreak } from '@/lib/daily'
import styles from './profile.module.css'

export default function ProfilePage() {
  const [name, setName]   = useState('')
  const [saved, setSaved] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setName(localStorage.getItem('roshi_name') ?? '')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setStreak(getStreak().count)
  }, [])

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem('roshi_name', trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <AppShell>
      <div className={styles.page}>

        <div className={styles.avatarRow}>
          <Avatar name={name} size={72} />
          {streak > 0 && <div className={styles.streakBadge}>{streak} day streak 🔥</div>}
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Your name</div>
          <input
            className={styles.input}
            value={name}
            onChange={e => { setName(e.target.value); setSaved(false) }}
            maxLength={20}
            placeholder="Enter your name"
            enterKeyHint="done"
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />
          <Button onClick={handleSave} disabled={!name.trim()}>
            {saved ? 'Saved ✓' : 'Save name'}
          </Button>
        </div>

        <Link href="/profile/starred" className={styles.menuRow}>
          <span className={styles.menuIcon}>★</span>
          <span className={styles.menuLabel}>Starred words</span>
          <svg className={styles.menuChevron} width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

      </div>
    </AppShell>
  )
}
