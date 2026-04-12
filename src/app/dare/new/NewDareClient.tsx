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
  const [hasTrap, setHasTrap]             = useState(false)
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
      has_trap:  hasTrap,
    }))
    const { data: inserted } = await supabase.from('dares').insert(rows).select('id')
    if (inserted?.length === 1) {
      const dareUrl = `${window.location.origin}/dare/${inserted[0].id}`
      if (navigator.share) {
        try {
          await navigator.share({
            text: `i dared you with "${selectedWord}" on roshi's word game. can you beat me?`,
            url: dareUrl,
          })
        } catch { /* user dismissed share sheet — that's fine */ }
      }
      setDareLink(dareUrl)
      setSending(false)
      return
    }
    router.push('/')
  }

  const copyLink = () => {
    if (!dareLink) return
    navigator.clipboard.writeText(dareLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const displayWord    = search.trim() || selectedWord
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

        <button
          className={[styles.trapToggle, hasTrap ? styles.trapActive : ''].filter(Boolean).join(' ')}
          onClick={() => setHasTrap(t => !t)}
        >
          <span className={styles.trapIcon}>🪤</span>
          <div className={styles.trapInfo}>
            <div className={styles.trapLabel}>Set a trap</div>
            <div className={styles.trapHint}>
              {hasTrap
                ? 'They fail → you get +10 pts. They nail it → they get +10 bonus.'
                : 'Bet against them. Costs nothing.'}
            </div>
          </div>
          <div className={[styles.trapDot, hasTrap ? styles.trapDotOn : ''].filter(Boolean).join(' ')} />
        </button>

        <div className={styles.spacer} />

        {dareLink && (
          <div className={styles.dareLinkBox}>
            <div className={styles.dareLinkLabel}>Dare sent! Share the link:</div>
            <div className={styles.dareLinkRow}>
              <span className={styles.dareLinkUrl}>{dareLink}</span>
              <button className={styles.dareLinkCopy} onClick={copyLink}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button className={styles.dareLinkDone} onClick={() => router.push('/')}>Done</button>
          </div>
        )}

        {!dareLink && (
          <Button onClick={handleSend} disabled={!canSend}>
            {canSend
              ? `Send "${displayWord}" to ${selectedNames.join(', ')}`
              : sending ? 'Sending…' : 'Send dare'}
          </Button>
        )}
      </div>
    </AppShell>
  )
}
