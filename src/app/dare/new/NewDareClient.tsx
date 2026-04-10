'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { GREWord } from '@/lib/gre-words'
import styles from './page.module.css'

interface UserRow { id: string; name: string }

export default function NewDareClient({ words }: { words: GREWord[] }) {
  const router = useRouter()
  const [search, setSearch]               = useState('')
  const [selectedWord, setSelectedWord]   = useState<string | null>(null)
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [friends, setFriends]             = useState<UserRow[]>([])
  const [sending, setSending]             = useState(false)
  const [myId, setMyId]                   = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setMyId(user.id)
      supabase
        .from('users')
        .select('id, name')
        .neq('id', user.id)
        .then(({ data }) => setFriends((data as UserRow[]) ?? []))
    })
  }, [])

  const toggleFriend = (id: string) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const query    = search.trim().toLowerCase()
  const filtered = query
    ? words.filter(w => w.word.startsWith(query)).slice(0, 12)
    : words.slice(0, 12)

  const canSend = selectedWord && selectedFriends.length > 0 && !sending

  const handleSend = async () => {
    if (!canSend || !myId || !selectedWord) return
    setSending(true)
    const supabase = createClient()
    const rows = selectedFriends.map(friendId => ({
      from_user: myId,
      to_user:   friendId,
      word:      selectedWord,
      level:     1,
      status:    'pending',
    }))
    await supabase.from('dares').insert(rows)
    router.push('/')
  }

  const displayWord    = search.trim() || selectedWord
  const selectedNames  = friends.filter(f => selectedFriends.includes(f.id)).map(f => f.name)

  return (
    <AppShell>
      <div className={styles.screen}>
        <Link href="/" className={styles.backBtn}>← Back</Link>
        <div className={styles.heading}>Dare someone</div>

        <div className={styles.sectionLabel}>Pick a word</div>
        <input
          className={styles.searchInput}
          placeholder="Search any word..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedWord(null) }}
        />

        <div className={styles.wordGrid}>
          {filtered.map(({ word, definition }) => (
            <button
              key={word}
              className={[styles.wordChip, selectedWord === word ? styles.selected : ''].join(' ')}
              onClick={() => setSelectedWord(word)}
            >
              <div className={styles.chipWord}>{word}</div>
              <div className={styles.chipVibe}>{definition.slice(0, 28).replace(/[;,]?\s*\w*$/, '…')}</div>
            </button>
          ))}
        </div>

        <div className={styles.sectionLabel}>
          Dare who? <span className={styles.sectionLabelNote}>(tap all that apply)</span>
        </div>
        <div className={styles.friendList}>
          {friends.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>No other players yet.</div>
          )}
          {friends.map(({ id, name }) => (
            <div
              key={id}
              className={[styles.friendChip, selectedFriends.includes(id) ? styles.selected : ''].join(' ')}
              onClick={() => toggleFriend(id)}
            >
              <Avatar name={name} size={36} />
              <div className={styles.friendName}>{name}</div>
            </div>
          ))}
        </div>

        <div className={styles.spacer} />

        <Button onClick={handleSend} disabled={!canSend}>
          {canSend
            ? `Send "${displayWord}" to ${selectedNames.join(', ')} →`
            : sending ? 'Sending…' : 'Send dare →'}
        </Button>
      </div>
    </AppShell>
  )
}
