'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import LevelHero from '@/components/home/LevelHero'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import { getStreak, hasDoneToday } from '@/lib/daily'
import styles from './page.module.css'

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

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
  const [myPoints, setMyPoints] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak]   = useState(0)
  const [dailyDone, setDailyDone] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setStreak(getStreak().count)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setDailyDone(hasDoneToday())
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const [{ data: daresData }, { data: completedDares }] = await Promise.all([
        supabase
          .from('dares')
          .select('*, from_profile:from_user(name), to_profile:to_user(name)')
          .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
          .order('created_at', { ascending: false }),
        supabase
          .from('dares')
          .select('from_user, to_user, from_points, to_points')
          .eq('status', 'complete')
          .or(`from_user.eq.${user.id},to_user.eq.${user.id}`),
      ])

      setDares((daresData as DareRow[]) ?? [])

      let pts = 0
      for (const d of completedDares ?? []) {
        if (d.from_user === user.id && d.from_points != null) pts += d.from_points
        if (d.to_user   === user.id && d.to_points   != null) pts += d.to_points
      }
      setMyPoints(pts)
      setLoading(false)
    })
  }, [])

  const pendingDares = dares.filter(d => d.status === 'pending' && d.to_user === userId)
  const otherDares   = dares.filter(d => !(d.status === 'pending' && d.to_user === userId))

  return (
    <AppShell>
      <div className={styles.page}>

        <LevelHero />

        <div className={styles.twoCol}>
          <Link href="/daily" className={styles.tileCard}>
            <span className={styles.tileLabel}>Roshi&apos;s Daily</span>
            {streak > 0
              ? <span className={styles.tileStreak}>{streak} day streak 🔥</span>
              : <span className={styles.tileAction}>{dailyDone ? 'Done ✓' : 'Play →'}</span>
            }
          </Link>
          {myPoints !== null && (
            <Link href="/leaderboard" className={styles.tileCard}>
              <span className={styles.tileLabel}>{myPoints} pts</span>
              <span className={styles.tileAction}>Leaderboard →</span>
            </Link>
          )}
        </div>

        {loading ? <DaresSkeleton /> : (
          <>
            {pendingDares.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Your turn</span>
                  <span className={styles.sectionBadge}>{pendingDares.length}</span>
                </div>
                <div className={styles.chipRow}>
                  {pendingDares.map(dare => (
                    <Link key={dare.id} href={`/dare/${dare.id}`} className={styles.chip}>
                      <Avatar name={dare.from_profile?.name ?? '?'} size={28} />
                      <span className={styles.chipName}>{dare.from_profile?.name}</span>
                      <span className={styles.chipDot} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {otherDares.length > 0 ? (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Dares</span>
                  <Link href="/dare/new" className={styles.sectionAction}>+ New dare</Link>
                </div>
                <div className={styles.dareList}>
                  {otherDares.slice(0, 5).map(dare => {
                    const isWaiting  = dare.status === 'pending' && dare.from_user === userId
                    const isComplete = dare.status === 'complete'
                    const fromLine   = isWaiting
                      ? `You → ${dare.to_profile?.name}`
                      : `${dare.from_profile?.name} → you`
                    const pts  = dare.from_user === userId ? dare.from_points : dare.to_points
                    const who  = dare.from_user === userId ? 'You' : dare.from_profile?.name
                    const row = (
                      <div className={[styles.dareRow, isComplete ? styles.dimmed : ''].join(' ')}>
                        <Avatar name={isWaiting ? dare.to_profile?.name ?? '?' : dare.from_profile?.name ?? '?'} size={32} />
                        <div className={styles.dareInfo}>
                          <span className={styles.dareWord}>{dare.word}</span>
                          <span className={styles.dareMeta}>{fromLine} · {relativeTime(dare.created_at)}</span>
                        </div>
                        {isWaiting  && <span className={`${styles.tag} ${styles.tagMuted}`}>Waiting</span>}
                        {isComplete && pts != null && <span className={`${styles.tag} ${styles.tagDone}`}>{who} +{pts}</span>}
                      </div>
                    )
                    return dare.status === 'pending' && dare.to_user === userId
                      ? <Link key={dare.id} href={`/dare/${dare.id}`} className={styles.dareRowLink}>{row}</Link>
                      : <div key={dare.id}>{row}</div>
                  })}
                </div>
              </div>
            ) : !loading && dares.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>No dares yet.</div>
                <div className={styles.emptyHint}>Dare someone to get started.</div>
                <Link href="/dare/new" className={styles.emptyBtn}>+ Dare someone</Link>
              </div>
            )}
          </>
        )}

      </div>

    </AppShell>
  )
}
