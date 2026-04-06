'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import RoshiDisplay from '@/components/mascot/RoshiDisplay'
import { MOCK_PLAYER } from '@/lib/mock'
import type { Dare } from '@/lib/mock'
import type { Sentence } from '@/lib/gre-words'
import styles from './dare.module.css'

type Stage = 'sentence' | 'definition' | 'result'

interface DareFlowProps {
  dare: Dare
  sentences: Sentence[]
  definition: string | null
}

const MOCK_SCORES = [
  { name: MOCK_PLAYER, pts: 18 },
  { name: 'Sam',       pts: 12 },
  { name: 'Alex',      pts: 9  },
]

interface FeedbackBar {
  variant: 'correct' | 'wrong'
  headline: string
  sub: string
  onContinue: () => void
}

export default function DareFlow({ dare, sentences, definition }: DareFlowProps) {
  const [stage, setStage]                   = useState<Stage>('sentence')
  const [selected, setSelected]             = useState<number | null>(null)
  const [answerResult, setAnswerResult]     = useState<'correct' | 'wrong' | null>(null)
  const [sentenceCorrect, setSentenceCorrect] = useState(false)
  const [feedback, setFeedback]             = useState<FeedbackBar | null>(null)
  const [userDef, setUserDef]               = useState('')
  const [points, setPoints]                 = useState(0)
  const [checking, setChecking]             = useState(false)
  const [defCorrect, setDefCorrect]         = useState<boolean | null>(null)


  const pickSentence = useCallback((i: number) => {
    if (answerResult) return
    const isCorrect = sentences[i]?.correct ?? false
    setSelected(i)
    setSentenceCorrect(isCorrect)
    setAnswerResult(isCorrect ? 'correct' : 'wrong')

    // Auto-advance after showing result
    setTimeout(() => {
      if (isCorrect) {
        setStage('definition')
      } else {
        setPoints(0)
        setStage('result')
      }
    }, 1200)
  }, [answerResult, sentences])

  const submitDefinition = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: dare.word, definition: userDef }),
      })
      const { correct } = await res.json()
      const earned = correct ? 10 : 3
      setDefCorrect(correct)
      setPoints(earned)
      setFeedback({
        variant: correct ? 'correct' : 'wrong',
        headline: correct ? 'You nailed it!' : 'Close, but not quite.',
        sub: correct ? `+${earned} points` : `+${earned} points for trying`,
        onContinue: () => { setFeedback(null); setStage('result') },
      })
    } catch {
      setDefCorrect(null)
      setPoints(3)
      setFeedback({
        variant: 'wrong',
        headline: 'Hmm, something went wrong.',
        sub: '+3 points for trying',
        onContinue: () => { setFeedback(null); setStage('result') },
      })
    } finally {
      setChecking(false)
    }
  }, [dare.word, userDef])

  const maxPts = Math.max(...MOCK_SCORES.map(s => s.pts), points + 18)

  const resultExpression = !sentenceCorrect ? 'disappointed' : defCorrect === true ? 'happy' : 'idle'

  return (
    <AppShell>
      <div className={styles.screen}>

        {/* ── Progress bar (sentence + definition stages only) ── */}
        {stage !== 'result' && (
          <div className={styles.progress}>
            <div className={[styles.progressStep, styles.progressActive].join(' ')}>
              <div className={styles.progressDot} />
              <span>Sentence</span>
            </div>
            <div className={styles.progressLine} />
            <div className={[styles.progressStep, stage === 'definition' ? styles.progressActive : styles.progressDim].join(' ')}>
              <div className={styles.progressDot} />
              <span>Definition</span>
            </div>
          </div>
        )}

        {/* ── Back ── */}
        <Link href="/" className={styles.backBtn}>← Back</Link>

        {/* ── SENTENCE STAGE ── */}
        {stage === 'sentence' && (
          <>
            <div className={styles.eyebrow}>The Dare</div>
            <div className={styles.challenger}>{dare.from} challenged you</div>
            <div className={styles.heroWord}>{dare.word}</div>

            <div className={styles.mcqPrompt}>Which sentence uses this word correctly?</div>

            <div className={styles.options}>
              {sentences.map((s, i) => {
                const isSelected = selected === i
                const isCorrect  = answerResult && isSelected && sentences[i].correct
                const isWrong    = answerResult && isSelected && !sentences[i].correct
                return (
                  <button
                    key={i}
                    className={[
                      styles.option,
                      isSelected && !answerResult ? styles.selected : '',
                      isCorrect ? styles.optionCorrect : '',
                      isWrong   ? styles.optionWrong   : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => pickSentence(i)}
                  >
                    {s.sentence}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* ── DEFINITION STAGE ── */}
        {stage === 'definition' && (
          <>
            <div className={styles.defPrompt}>
              Define <strong>{dare.word}</strong> in your own words.
            </div>
            <textarea
              className={styles.defInput}
              placeholder="Type your definition..."
              value={userDef}
              onChange={e => setUserDef(e.target.value)}
            />
            <div className={styles.defHint}>Plain English is fine.</div>

            <div className={styles.spacer} />
            <Button onClick={submitDefinition} disabled={userDef.trim().length < 4 || checking}>
              {checking ? 'Checking…' : 'Submit →'}
            </Button>
          </>
        )}

        {/* ── RESULT STAGE ── */}
        {stage === 'result' && (
          <>
            <div className={styles.resultRoshi}>
              <RoshiDisplay expression={resultExpression} size={140} />
            </div>

            <div className={styles.pointsBadge}>+{points}</div>
            <div className={styles.pointsLabel}>
              {!sentenceCorrect
                ? 'Better luck next time.'
                : defCorrect === true
                  ? 'You nailed it.'
                  : 'Close, but not quite.'}
            </div>

            {definition && (
              <div className={styles.definitionReveal}>
                <div className={styles.definitionWord}>{dare.word}</div>
                <div className={styles.definitionText}>{definition}</div>
              </div>
            )}

            <Link href="/dare/new" style={{ display: 'block' }}>
              <Button>
                {dare.from === 'Roshi' ? 'Dare a friend →' : `Dare ${dare.from} back →`}
              </Button>
            </Link>

            <div className={styles.divider} />

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

      {/* ── SLIDE-UP FEEDBACK BAR (definition result only) ── */}
      {feedback && stage === 'definition' && (
        <div className={[styles.feedbackBar, styles[`feedbackBar_${feedback.variant}`]].join(' ')}>
          <div className={styles.feedbackBarContent}>
            <div className={styles.feedbackBarHeadline}>{feedback.headline}</div>
            {feedback.sub && (
              <div className={styles.feedbackBarSub}>{feedback.sub}</div>
            )}
          </div>
          <button className={styles.feedbackBarBtn} onClick={feedback.onContinue}>
            Continue →
          </button>
        </div>
      )}

    </AppShell>
  )
}
