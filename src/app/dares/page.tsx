'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import styles from './dares.module.css'

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

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

type Tab = 'received' | 'sent'

export default function DaresPage() {
  const [dares, setDares]   = useState<DareRow[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState<Tab>('received')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('dares')
        .select('id, word, from_user, to_user, status, from_points, to_points, created_at, from_profile:from_user(name), to_profile:to_user(name)')
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
        .order('created_at', { ascending: false })
      setDares((data as unknown as DareRow[]) ?? [])
      setLoading(false)
    })
  }, [])

  const received = dares.filter(d => d.to_user === userId)
  const sent     = dares.filter(d => d.from_user === userId)
  const shown    = tab === 'received' ? received : sent

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.headingRow}>
          <div className={styles.heading}>Dares</div>
          <Link href="/dare/new" className={styles.newBtn}>+ New</Link>
        </div>

        <div className={styles.tabs}>
          <button
            className={[styles.tab, tab === 'received' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('received')}
          >
            Received · {received.length}
          </button>
          <button
            className={[styles.tab, tab === 'sent' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('sent')}
          >
            Sent · {sent.length}
          </button>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : shown.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyText}>Nothing here yet.</div>
            <div className={styles.emptyHint}>
              {tab === 'received' ? 'No one has dared you yet.' : 'You haven\'t dared anyone yet.'}
            </div>
            {tab === 'sent' && (
              <Link href="/dare/new" className={styles.emptyBtn}>+ New dare</Link>
            )}
          </div>
        ) : (
          <div className={styles.list}>
            {shown.map(dare => {
              const isPending  = dare.status === 'pending'
              const otherName  = tab === 'received' ? dare.from_profile?.name : dare.to_profile?.name
              const myPts      = tab === 'received' ? dare.to_points : dare.from_points
              return (
                <Link
                  key={dare.id}
                  href={`/dare/${dare.id}`}
                  className={[styles.row, isPending ? styles.rowPending : ''].join(' ')}
                >
                  <Avatar name={otherName ?? '?'} size={36} />
                  <div className={styles.info}>
                    <div className={styles.word}>{dare.word}</div>
                    <div className={styles.meta}>
                      {tab === 'received' ? `From ${otherName}` : `To ${otherName}`} · {relativeTime(dare.created_at)}
                    </div>
                  </div>
                  {isPending ? (
                    <span className={styles.tagPending}>
                      {tab === 'received' ? 'Your turn' : 'Waiting'}
                    </span>
                  ) : myPts != null ? (
                    <span className={styles.tagDone}>+{myPts}</span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
