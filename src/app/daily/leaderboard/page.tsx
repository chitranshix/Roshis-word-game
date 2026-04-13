'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import styles from './leaderboard.module.css'

interface Entry {
  rank:        number
  userId:      string
  name:        string
  points:      number
  completedAt: string
}

export default function DailyLeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [word, setWord]       = useState('')
  const [myId, setMyId]       = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setMyId(user.id)
    })
    fetch('/api/daily-leaderboard')
      .then(r => r.json())
      .then(d => { setWord(d.word ?? ''); setEntries(d.entries ?? []) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.heading}>Today&apos;s daily</div>
        {word && <div className={styles.wordBadge}>{word}</div>}

        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : entries.length === 0 ? (
          <div className={styles.empty}>No one has played today yet. Go first.</div>
        ) : (
          <div className={styles.list}>
            {entries.map(e => (
              <div key={e.userId} className={[styles.row, e.userId === myId ? styles.rowMe : ''].filter(Boolean).join(' ')}>
                <div className={styles.rank}>#{e.rank}</div>
                <Avatar name={e.name} size={36} />
                <div className={styles.info}>
                  <div className={styles.name}>{e.name}{e.userId === myId ? ' (you)' : ''}</div>
                </div>
                <div className={styles.pts}>{e.points} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
