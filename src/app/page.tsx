'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import LevelHero from '@/components/home/LevelHero'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import { getStreak, hasDoneToday } from '@/lib/daily'
import styles from './page.module.css'


interface DareRow {
  id: string
  word: string
  from_user: string
  to_user: string
  status: string
  from_points: number | null
  to_points: number | null
  created_at: string
  from_profile: { name: string } | null
  to_profile: { name: string } | null
}

function DaresSkeleton() {
  return (
    <div className={styles.section}>
      <div className={styles.skeletonLabel} />
      <div className={styles.dareList}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.skeletonRow}>
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonLines}>
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [dares, setDares]     = useState<DareRow[]>([])
  const [userId, setUserId]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak]     = useState(0)
  const [dailyDone, setDailyDone] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setStreak(getStreak().count)
    setDailyDone(hasDoneToday())
  }, [])

  useEffect(() => {
    // Subscribe to push notifications once per browser
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().then(async permission => {
        if (permission !== 'granted') return
        try {
          const reg = await navigator.serviceWorker.ready
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          })
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub.toJSON() }),
          })
        } catch { /* permission denied or unsupported */ }
      })
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data: daresData } = await supabase
        .from('dares')
        .select('*, from_profile:from_user(name), to_profile:to_user(name)')
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
        .order('created_at', { ascending: false })

      setDares((daresData as DareRow[]) ?? [])
      setLoading(false)
    })
  }, [])

  const pendingForMe    = dares.filter(d => d.status === 'pending' && d.to_user === userId)
  const waitingCount    = dares.filter(d => d.status === 'pending' && d.from_user === userId).length

  return (
    <AppShell>
      <div className={styles.page}>

        <LevelHero />

        <Link href="/daily" className={[styles.dailyHero, dailyDone ? styles.dailyHeroDone : ''].filter(Boolean).join(' ')}>
          <div className={styles.dailyHeroTop}>
            <span className={styles.dailyHeroLabel}>Roshi&apos;s Word of the Day</span>
            {dailyDone
              ? <span className={styles.dailyHeroDoneTag}>Done ✓</span>
              : <span className={styles.dailyHeroPlay}>Play →</span>
            }
          </div>
          {streak > 0
            ? <span className={styles.dailyHeroStreak}>{streak} day streak 🔥</span>
            : <span className={styles.dailyHeroHint}>{dailyDone ? 'Come back tomorrow.' : "Today's word is waiting."}</span>
          }
        </Link>

        {loading ? <DaresSkeleton /> : (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Dares</span>
              <Link href="/dare/new" className={styles.sectionAction}>+ New</Link>
            </div>

            {pendingForMe.length > 0 ? (
              <>
                <div className={styles.chipRow}>
                  {pendingForMe.map(dare => (
                    <Link key={dare.id} href={`/dare/${dare.id}`} className={styles.chip}>
                      <Avatar name={dare.from_profile?.name ?? '?'} size={28} />
                      <span className={styles.chipName}>{dare.from_profile?.name}</span>
                      <span className={styles.chipDot} />
                    </Link>
                  ))}
                </div>
                {waitingCount > 0 && (
                  <Link href="/profile" className={styles.waitingPill}>
                    {waitingCount} waiting on {waitingCount === 1 ? 'a friend' : 'friends'} →
                  </Link>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>No open dares.</div>
                <div className={styles.emptyHint}>
                  {waitingCount > 0
                    ? `${waitingCount} sent, waiting on ${waitingCount === 1 ? 'a friend' : 'friends'}.`
                    : 'Dare someone to get started.'}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </AppShell>
  )
}
