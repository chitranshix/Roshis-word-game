'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import styles from './page.module.css'

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')

  const handleJoin = () => {
    if (!name.trim()) return
    // In real app: persist to localStorage + Supabase
    localStorage.setItem('roshi_name', name.trim())
    router.push('/')
  }

  return (
    <div className={styles.screen}>
      <div className={styles.logo}>Roshi</div>
      <div className={styles.body}>
        <div className={styles.heading}>What&apos;s your name?</div>
        <div className={styles.sub}>No account needed. Just your name.</div>
        <input
          className={styles.input}
          placeholder="Your name..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          autoFocus
          maxLength={20}
        />
        <Button onClick={handleJoin} disabled={name.trim().length < 2}>
          Let&apos;s play →
        </Button>
      </div>
    </div>
  )
}
