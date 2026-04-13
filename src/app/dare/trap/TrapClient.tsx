'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import styles from './trap.module.css'

interface UserRow { id: string; name: string }

interface Props {
  word:    string | null
  friends: UserRow[]
  myId:    string | null
}

export default function TrapClient({ word, friends, myId }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [sending, setSending]   = useState(false)

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])

  const canSend = word && selected.length > 0 && !sending

  const handleSet = async () => {
    if (!canSend || !myId || !word) return
    setSending(true)
    const supabase = createClient()
    const rows = selected.map(friendId => ({
      from_user: myId,
      to_user:   friendId,
      word,
      level:     1,
      status:    'pending',
      has_trap:  true,
    }))
    const { data: inserted } = await supabase.from('dares').insert(rows).select('id, to_user')
    if (inserted?.length) {
      const { data: me } = await supabase.from('users').select('name').eq('id', myId).single()
      for (const row of inserted) {
        fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toUserId: row.to_user,
            title: '🪤 You have been trapped!',
            body: `${me?.name ?? 'Someone'} set a trap on "${word}". Can you escape it?`,
            url: `/dare/${row.id}`,
          }),
        })
      }
    }
    router.push('/')
  }

  return (
    <AppShell>
      <div className={styles.screen}>
        <div className={styles.heading}>Set a trap</div>
        <div className={styles.hint}>
          If they fail the dare, you get +10 pts. If they nail it, they get +10 bonus.
        </div>

        {word && (
          <div className={styles.wordBox}>
            <span className={styles.wordLabel}>Word</span>
            <span className={styles.wordValue}>{word}</span>
          </div>
        )}

        <div className={styles.sectionLabel}>Trap who?</div>
        <div className={styles.friendList}>
          {friends.length === 0 && (
            <div className={styles.empty}>No other players yet.</div>
          )}
          {friends.map(({ id, name }) => (
            <div
              key={id}
              className={[styles.friendChip, selected.includes(id) ? styles.selected : ''].join(' ')}
              onClick={() => toggle(id)}
            >
              <Avatar name={name} size={48} />
              <div className={styles.friendName}>{name}</div>
            </div>
          ))}
        </div>

        <div className={styles.spacer} />

        <Button onClick={handleSet} disabled={!canSend}>
          {sending ? 'Setting trap…' : 'Set trap'}
        </Button>
      </div>
    </AppShell>
  )
}
