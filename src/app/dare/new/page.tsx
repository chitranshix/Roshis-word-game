'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import styles from './page.module.css'

const SUGGESTED_WORDS = [
  { word: 'ephemeral',   vibe: 'poetic'    },
  { word: 'luminous',    vibe: 'vivid'     },
  { word: 'serendipity', vibe: 'whimsical' },
  { word: 'avarice',     vibe: 'sharp'     },
  { word: 'pellucid',    vibe: 'precise'   },
  { word: 'solipsism',   vibe: 'strange'   },
]

const FRIENDS = ['Sam', 'Alex', 'Priya']

export default function NewDarePage() {
  const router = useRouter()
  const [search, setSearch]             = useState('')
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])

  const toggleFriend = (name: string) => {
    setSelectedFriends(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    )
  }

  const canSend = selectedWord && selectedFriends.length > 0

  const handleSend = () => {
    // In real app: create dare records in Supabase, then navigate home
    router.push('/')
  }

  const displayWord = search.trim() || selectedWord

  return (
    <AppShell>
      <div className={styles.screen}>
        <Link href="/" className={styles.backBtn}>← Back</Link>
        <div className={styles.heading}>Dare someone</div>

        {/* Word search */}
        <div className={styles.sectionLabel}>Pick a word</div>
        <input
          className={styles.searchInput}
          placeholder="Search any word..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedWord(null) }}
        />

        {/* Suggestions */}
        {!search && (
          <div className={styles.wordGrid}>
            {SUGGESTED_WORDS.map(({ word, vibe }) => (
              <button
                key={word}
                className={[styles.wordChip, selectedWord === word ? styles.selected : ''].join(' ')}
                onClick={() => setSelectedWord(word)}
              >
                <div className={styles.chipWord}>{word}</div>
                <div className={styles.chipVibe}>{vibe}</div>
              </button>
            ))}
          </div>
        )}

        {/* Friend selection */}
        <div className={styles.sectionLabel}>Dare who? <span className={styles.sectionLabelNote}>(tap all that apply)</span></div>
        <div className={styles.friendList}>
          {FRIENDS.map(name => (
            <div
              key={name}
              className={[styles.friendChip, selectedFriends.includes(name) ? styles.selected : ''].join(' ')}
              onClick={() => toggleFriend(name)}
            >
              <img
                src={`https://api.dicebear.com/9.x/thumbs/svg?backgroundColor=transparent&seed=${name}`}
                className={styles.friendAvatar}
                alt={name}
              />
              <div className={styles.friendName}>{name}</div>
            </div>
          ))}
        </div>

        <div className={styles.spacer} />

        <Button onClick={handleSend} disabled={!canSend}>
          {canSend
            ? `Send "${displayWord}" to ${selectedFriends.join(', ')} →`
            : 'Send dare →'}
        </Button>
      </div>
    </AppShell>
  )
}
