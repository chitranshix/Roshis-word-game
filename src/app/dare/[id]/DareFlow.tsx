'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import RoshiDisplay from '@/components/mascot/RoshiDisplay'
import SpeechBubble from '@/components/ui/SpeechBubble'
import { createClient } from '@/lib/supabase'
import type { Dare } from '@/lib/mock'
import type { Sentence } from '@/lib/gre-words'
import styles from './dare.module.css'

type Stage = 'sentence' | 'definition' | 'result'

interface DareFlowProps {
  dare: Dare
  sentences: Sentence[]
  definition: string | null
  dareId: string
  isChallengee: boolean
}

export default function DareFlow({ dare, sentences, definition, dareId, isChallengee }: DareFlowProps) {
  const router = useRouter()
  const [stage, setStage]                     = useState<Stage>('sentence')
  const [selected, setSelected]               = useState<number | null>(null)
  const [answerResult, setAnswerResult]       = useState<'correct' | 'wrong' | null>(null)
  const [sentenceCorrect, setSentenceCorrect] = useState(false)
  const [userDef, setUserDef]                 = useState('')
  const [points, setPoints]                   = useState(0)
  const [checking, setChecking]               = useState(false)
  const [defCorrect, setDefCorrect]           = useState<boolean | null>(null)

  const pickSentence = useCallback((i: number) => {
    if (answerResult) return
    const isCorrect = sentences[i]?.correct ?? false
    setSelected(i)
    setSentenceCorrect(isCorrect)
    setAnswerResult(isCorrect ? 'correct' : 'wrong')
    if (navigator.vibrate) navigator.vibrate(isCorrect ? [10, 50, 10] : [80])

    setTimeout(() => {
      if (isCorrect) {
        setStage('definition')
      } else {
        setPoints(0)
        setStage('result')
        saveDareResult(0)
      }
    }, 1200)
  }, [answerResult, sentences])

  const saveDareResult = useCallback(async (earned: number) => {
    const supabase = createClient()
    const col = isChallengee ? 'to_points' : 'from_points'
    await supabase
      .from('dares')
      .update({ [col]: earned, status: 'complete' })
      .eq('id', dareId)
  }, [dareId, isChallengee])

  const submitDefinition = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: dare.word, definition: userDef, actualDefinition: definition }),
      })
      const { correct } = await res.json()
      const earned = correct ? 10 : 3
      setDefCorrect(correct)
      setPoints(earned)
      setStage('result')
      await saveDareResult(earned)
    } catch {
      setDefCorrect(null)
      setPoints(3)
      setStage('result')
      await saveDareResult(3)
    } finally {
      setChecking(false)
    }
  }, [dare.word, userDef, saveDareResult])

  const resultExpression = !sentenceCorrect ? 'disappointed' : defCorrect === true ? 'happy' : 'idle'

  return (
    <AppShell>
      <div className={styles.screen}>

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

        <button className={styles.backBtn} onClick={() => router.back()}>&#8592;</button>

        {stage === 'sentence' && (
          <>
            <div className={styles.eyebrow}>The Dare</div>
            <div className={styles.challenger}>{dare.from} challenged you</div>
            <div className={styles.heroWord}>{dare.word}</div>
            <div className={styles.mcqPrompt}>Which sentence(s) use this word correctly?</div>
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
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && userDef.trim().length >= 4) { e.preventDefault(); submitDefinition() } }}
              autoFocus
              inputMode="text"
              enterKeyHint="done"
            />
            <div className={styles.defHint}>Plain English is fine.</div>
            <Button onClick={submitDefinition} disabled={userDef.trim().length < 4 || checking}>
              {checking ? 'Checking…' : 'Submit'}
            </Button>
          </>
        )}

        {stage === 'result' && (
          <>
            <div className={styles.resultRoshi}>
              <RoshiDisplay expression={resultExpression} size={140} />
            </div>

            <SpeechBubble tail="top">
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
            </SpeechBubble>

            <Link href="/dare/new" style={{ display: 'block' }}>
              <Button>
                {dare.from === 'Roshi' ? 'Dare a friend' : `Dare ${dare.from} back`}
              </Button>
            </Link>

            <Link href="/" style={{ display: 'block', marginTop: 12 }}>
              <Button variant="subtle">Back to home</Button>
            </Link>
          </>
        )}

      </div>
    </AppShell>
  )
}
