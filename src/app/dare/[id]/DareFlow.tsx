'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import { MOCK_PLAYER, MOCK_SENTENCES } from '@/lib/mock'
import type { Dare } from '@/lib/mock'
import styles from './dare.module.css'

type Stage = 'sentence' | 'definition' | 'result'

interface DareFlowProps { dare: Dare }

const MOCK_SCORES = [
  { name: MOCK_PLAYER, pts: 18 },
  { name: 'Sam',       pts: 12 },
  { name: 'Alex',      pts: 9  },
]

const DEFINITION_MAP: Record<string, { pos: string; text: string }> = {
  loquacious: { pos: 'adjective', text: 'Tending to talk a great deal; garrulous.' },
  ephemeral:  { pos: 'adjective', text: 'Lasting for a very short time.' },
  luminous:   { pos: 'adjective', text: 'Bright or shining, especially in the dark.' },
  pellucid:   { pos: 'adjective', text: 'Translucently clear; easily understood.' },
}

export default function DareFlow({ dare }: DareFlowProps) {
  const [stage, setStage]           = useState<Stage>('sentence')
  const [selected, setSelected]     = useState<number | null>(null)
  const [sentenceCorrect, setSentenceCorrect] = useState(false)
  const [definition, setDefinition] = useState('')
  const [points, setPoints]         = useState(0)
  const [checking, setChecking]     = useState(false)
  const [defCorrect, setDefCorrect] = useState<boolean | null>(null)

  const sentences = MOCK_SENTENCES[dare.word] ?? []
  const defInfo   = DEFINITION_MAP[dare.word]

  const confirmSentence = () => {
    if (selected === null) return
    const isCorrect = sentences[selected]?.correct ?? false
    setSentenceCorrect(isCorrect)
    if (isCorrect) {
      setStage('definition')
    } else {
      setPoints(0)
      setStage('result')
    }
  }

  const submitDefinition = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: dare.word, definition }),
      })
      const { correct } = await res.json()
      setDefCorrect(correct)
      setPoints(correct ? 10 : 3)
    } catch {
      setDefCorrect(null)
      setPoints(3)
    } finally {
      setChecking(false)
      setStage('result')
    }
  }

  const maxPts = Math.max(...MOCK_SCORES.map(s => s.pts), points + 18)

  return (
    <AppShell>
      <div className={styles.screen}>

        {/* ── Back ── */}
        <Link href="/" className={styles.backBtn}>← Back</Link>

        {/* ── SENTENCE STAGE ── */}
        {stage === 'sentence' && (
          <>
            <div className={styles.eyebrow}>The Dare</div>
            <div className={styles.challenger}>{dare.from} challenged you</div>
            <div className={styles.heroWord}>{dare.word}</div>
            <div className={styles.wordPos}>adjective</div>

            <div className={styles.mcqPrompt}>Which sentence uses this word correctly?</div>

            <div className={styles.options}>
              {sentences.map((s, i) => (
                <button
                  key={i}
                  className={[styles.option, selected === i ? styles.selected : ''].join(' ')}
                  onClick={() => setSelected(i)}
                >
                  {s.sentence}
                </button>
              ))}
            </div>

            <div className={styles.spacer} />
            <Button onClick={confirmSentence} disabled={selected === null}>
              Confirm →
            </Button>
          </>
        )}

        {/* ── DEFINITION STAGE (correct sentence only) ── */}
        {stage === 'definition' && (
          <>
            <div className={[styles.feedbackHero, styles.correct].join(' ')}>Nice.</div>
            <div className={styles.defPrompt}>
              Now define <strong>{dare.word}</strong> in your own words.
            </div>
            <textarea
              className={styles.defInput}
              placeholder="Type your definition..."
              value={definition}
              onChange={e => setDefinition(e.target.value)}
            />
            <div className={styles.defHint}>Plain English is fine.</div>

            <div className={styles.spacer} />
            <Button onClick={submitDefinition} disabled={definition.trim().length < 4 || checking}>
              {checking ? 'Checking…' : 'Submit →'}
            </Button>
          </>
        )}

        {/* ── RESULT STAGE ── */}
        {stage === 'result' && (
          <>
            <div className={styles.pointsBadge}>+{points}</div>
            <div className={styles.pointsLabel}>
              {!sentenceCorrect
                ? 'Better luck next time.'
                : defCorrect === true
                  ? 'You nailed it.'
                  : 'Close, but not quite.'}
            </div>

            {defInfo && (
              <div className={styles.definitionReveal}>
                <div className={styles.definitionWord}>{dare.word}</div>
                <div className={styles.definitionPos}>{defInfo.pos}</div>
                <div className={styles.definitionText}>{defInfo.text}</div>
              </div>
            )}

            <Link href="/dare/new" style={{ display: 'block' }}>
              <Button>
                {dare.from === 'Roshi' ? 'Dare a friend →' : `Dare ${dare.from} back →`}
              </Button>
            </Link>

            <div className={styles.divider} />

            {/* Scores */}
            {[{ name: MOCK_PLAYER, pts: 18 + points }, ...MOCK_SCORES.filter(s => s.name !== MOCK_PLAYER)].map(s => (
              <div key={s.name} className={styles.scoreRow}>
                <div className={styles.scoreName}>{s.name === MOCK_PLAYER ? 'You' : s.name}</div>
                <div className={styles.scoreBar}>
                  <div className={styles.scoreBarFill} style={{ width: `${(s.pts / maxPts) * 100}%` }} />
                </div>
                <div className={styles.scorePoints}>{s.pts}</div>
              </div>
            ))}

            <Link href="/" style={{ display: 'block' }}>
              <Button variant="subtle">Back to home</Button>
            </Link>
          </>
        )}

      </div>
    </AppShell>
  )
}
