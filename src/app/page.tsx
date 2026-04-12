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

  const pendingForMe    = dares.filter(d => d.status === 'pending' && d.to_user === userId)
  const waitingOnFriend = dares.filter(d => d.status === 'pending' && d.from_user === userId)
  const completedDaresList = dares.filter(d => d.status === 'complete').slice(0, 5)
  const noActiveDares   = pendingForMe.length === 0 && waitingOnFriend.length === 0

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
          <Link href="/leaderboard" className={styles.tileCard}>
            <span className={styles.tileLabel}>Leaderboard</span>
            <span className={styles.tileAction}>{myPoints !== null ? `${myPoints} pts →` : '→'}</span>
          </Link>
        </div>

        {loading ? <DaresSkeleton /> : (
          <>
            {/* Dares incoming — your turn */}
            {pendingForMe.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Your turn</span>
                  <span className={styles.sectionBadge}>{pendingForMe.length}</span>
                </div>
                <div className={styles.chipRow}>
                  {pendingForMe.map(dare => (
                    <Link key={dare.id} href={`/dare/${dare.id}`} className={styles.chip}>
                      <Avatar name={dare.from_profile?.name ?? '?'} size={28} />
                      <span className={styles.chipName}>{dare.from_profile?.name}</span>
                      <span className={styles.chipDot} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Dares sent — waiting on friends */}
            {waitingOnFriend.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Sent</span>
                  <Link href="/dare/new" className={styles.sectionAction}>+ New dare</Link>
                </div>
                <div className={styles.dareList}>
                  {waitingOnFriend.map(dare => (
                    <div key={dare.id} className={styles.dareRow}>
                      <Avatar name={dare.to_profile?.name ?? '?'} size={32} />
                      <div className={styles.dareInfo}>
                        <span className={styles.dareWord}>{dare.word}</span>
                        <span className={styles.dareMeta}>
                          Waiting on {dare.to_profile?.name} · {relativeTime(dare.created_at)}
                        </span>
                      </div>
                      <span className={`${styles.tag} ${styles.tagMuted}`}>Waiting</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed dares */}
            {completedDaresList.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Past</span>
                </div>
                <div className={styles.dareList}>
                  {completedDaresList.map(dare => {
                    const isSender   = dare.from_user === userId
                    const otherName  = isSender ? dare.to_profile?.name : dare.from_profile?.name
                    const myPts      = isSender ? dare.from_points : dare.to_points
                    return (
                      <Link key={dare.id} href={`/dare/${dare.id}`} className={styles.dareRow} style={{ opacity: 0.6, textDecoration: 'none' }}>
                        <Avatar name={otherName ?? '?'} size={32} />
                        <div className={styles.dareInfo}>
                          <span className={styles.dareWord}>{dare.word}</span>
                          <span className={styles.dareMeta}>
                            {isSender ? `Dared ${otherName}` : `From ${otherName}`} · {relativeTime(dare.created_at)}
                          </span>
                        </div>
                        {myPts != null && <span className={`${styles.tag} ${styles.tagMuted}`}>+{myPts}</span>}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && noActiveDares && completedDaresList.length === 0 && (
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
