'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase'
import type { GREWord } from '@/lib/gre-words'
import styles from './page.module.css'

interface UserRow { id: string; name: string }

interface Props {
  words:           GREWord[]
  preselectedWord: string | null
}

export default function NewDareClient({ words, preselectedWord }: Props) {
  const router = useRouter()
  const [search, setSearch]               = useState('')
  const [selectedWord, setSelectedWord]   = useState<string | null>(preselectedWord)
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [friends, setFriends]             = useState<UserRow[]>([])
  const [sending, setSending]             = useState(false)
  const [myId, setMyId]                   = useState<string | null>(null)
  const [dareLink, setDareLink]           = useState<string | null>(null)
  const [copied, setCopied]               = useState(false)
  const [recentWords, setRecentWords]     = useState<string[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setMyId(user.id)
      Promise.all([
        supabase.from('users').select('id, name').neq('id', user.id),
        supabase
          .from('point_events')
          .select('word')
          .eq('user_id', user.id)
          .not('word', 'is', null)
          .order('created_at', { ascending: false })
          .limit(30),
      ]).then(([{ data: friendsData }, { data: eventsData }]) => {
        setFriends((friendsData as UserRow[]) ?? [])
        // Deduplicate and take last 10 unique words
        const seen = new Set<string>()
        const recent: string[] = []
        for (const e of eventsData ?? []) {
          if (e.word && !seen.has(e.word)) { seen.add(e.word); recent.push(e.word) }
          if (recent.length >= 10) break
        }
        setRecentWords(recent)
      })
    })
  }, [])

  const toggleFriend = (id: string) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const query    = search.trim().toLowerCase()
  const filtered = query
    ? words.filter(w => w.word.includes(query)).slice(0, 12)
    : recentWords.length > 0
      ? recentWords.map(w => words.find(wd => wd.word === w)).filter(Boolean) as GREWord[]
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
      has_trap:  false,
    }))
    const { data: inserted } = await supabase.from('dares').insert(rows).select('id, to_user')
    // Notify each challenged friend
    if (inserted?.length) {
      const { data: me } = await supabase.from('users').select('name').eq('id', myId!).single()
      for (const row of inserted) {
        fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toUserId: row.to_user,
            title: '🎯 New dare!',
            body: `${me?.name ?? 'Someone'} dared you with "${selectedWord}". Can you beat them?`,
            url: `/dare/${row.id}`,
          }),
        })
      }
    }
    router.push('/')
  }

  const handleInvite = async () => {
    if (!selectedWord || !myId) return
    setSending(true)
    const supabase = createClient()
    const { data: me } = await supabase.from('users').select('name').eq('id', myId).single()
    // Create a dare with no to_user — stranger will claim it via the link
    const { data: inserted } = await supabase
      .from('dares')
      .insert([{ from_user: myId, word: selectedWord, level: 1, status: 'pending', has_trap: false }])
      .select('id')
    setSending(false)
    if (!inserted?.length) return
    const dareUrl = `${window.location.origin}/dare/${inserted[0].id}`
    if (navigator.share) {
      try {
        await navigator.share({
          text: `${me?.name ?? 'Someone'} dared you with "${selectedWord}" on Roshi. Can you beat them?`,
          url: dareUrl,
        })
      } catch { /* dismissed */ }
    }
    setDareLink(dareUrl)
  }

  const copyLink = () => {
    if (!dareLink) return
    navigator.clipboard.writeText(dareLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const selectedNames  = friends.filter(f => selectedFriends.includes(f.id)).map(f => f.name)

  return (
    <AppShell>
      <div className={styles.screen}>
        <div className={styles.heading}>Dare someone</div>

        {preselectedWord ? (
          <div className={styles.preselectedWord}>
            <span className={styles.preselectedLabel}>Word</span>
            <span className={styles.preselectedValue}>{preselectedWord}</span>
          </div>
        ) : (
          <>
            <div className={styles.sectionLabel}>
              {query ? 'Search results' : recentWords.length > 0 ? 'Recently played' : 'Pick a word'}
            </div>
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
          </>
        )}

        <div className={styles.sectionLabel}>
          Dare who? <span className={styles.sectionLabelNote}>(tap all that apply)</span>
        </div>
        <div className={styles.friendList}>
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
          <div
            className={[styles.friendChip, !selectedWord ? styles.friendChipDisabled : ''].filter(Boolean).join(' ')}
            onClick={selectedWord ? handleInvite : undefined}
          >
            <div className={styles.inviteAvatar}>📤</div>
            <div className={styles.friendName}>Invite</div>
          </div>
        </div>

        {dareLink && (
          <div className={styles.dareLinkBox}>
            <div className={styles.dareLinkLabel}>Link copied! Send it to anyone:</div>
            <div className={styles.dareLinkRow}>
              <span className={styles.dareLinkUrl}>{dareLink}</span>
              <button className={styles.dareLinkCopy} onClick={copyLink}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button className={styles.dareLinkDone} onClick={() => router.push('/')}>Done</button>
          </div>
        )}

        <div className={styles.spacer} />

        {!dareLink && (
          <Button onClick={handleSend} disabled={!canSend}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
        )}
      </div>
    </AppShell>
  )
}
