'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import styles from './leaderboard.module.css'

interface PlayerScore {
  id: string
  name: string
  points: number
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<PlayerScore[]>([])
  const [myId, setMyId]       = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      setMyId(user.id)

      // Fetch all users + completed dares + word play points in parallel
      const [{ data: users }, { data: dares }, { data: events }] = await Promise.all([
        supabase.from('users').select('id, name'),
        supabase.from('dares').select('from_user, to_user, from_points, to_points, has_trap, trap_winner').eq('status', 'complete'),
        supabase.from('point_events').select('user_id, points'),
      ])

      if (!users) { setLoading(false); return }

      // Aggregate points per user
      const totals: Record<string, number> = {}
      for (const u of users) totals[u.id] = 0
      for (const d of dares ?? []) {
        if (d.from_points != null) totals[d.from_user] = (totals[d.from_user] ?? 0) + d.from_points
        if (d.to_points   != null) totals[d.to_user]   = (totals[d.to_user]   ?? 0) + d.to_points
        if (d.has_trap && d.trap_winner === 'trapper') totals[d.from_user] = (totals[d.from_user] ?? 0) + 10
        if (d.has_trap && d.trap_winner === 'target')  totals[d.to_user]   = (totals[d.to_user]   ?? 0) + 10
      }
      for (const e of events ?? []) {
        totals[e.user_id] = (totals[e.user_id] ?? 0) + e.points
      }

      const ranked = users
        .map(u => ({ id: u.id, name: u.name, points: totals[u.id] ?? 0 }))
        .sort((a, b) => b.points - a.points)

      setPlayers(ranked)
      setLoading(false)
    })
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.heading}>Leaderboard</div>

        {loading ? (
          <div className={styles.loading}>loading…</div>
        ) : (
          <div className={styles.list}>
            {players.map((p, i) => (
              <div key={p.id} className={[styles.row, p.id === myId ? styles.mine : ''].join(' ')}>
                <div className={styles.rank}>
                  {i < 3 ? medals[i] : <span className={styles.rankNum}>{i + 1}</span>}
                </div>
                <Avatar name={p.name} size={36} />
                <div className={styles.name}>
                  {p.name}
                  {p.id === myId && <span className={styles.you}> you</span>}
                </div>
                <div className={styles.points}>{p.points} <span className={styles.pts}>pts</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
