'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import RoshiDisplay from '@/components/mascot/RoshiDisplay'
import SpeechBubble from '@/components/ui/SpeechBubble'
import { playCorrect, playWrong } from '@/lib/audio'
import { hasDoneToday, markDailyDone, getStreak } from '@/lib/daily'
import StarButton from '@/components/ui/StarButton'
import type { GREWord } from '@/lib/gre-words'
import styles from './daily.module.css'

type Stage = 'sentence' | 'definition' | 'result'

export default function DailyClient({ word }: { word: GREWord }) {
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [stage, setStage]             = useState<Stage>('sentence')
  const [selected, setSelected]       = useState<number | null>(null)
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null)
  const [sentenceCorrect, setSentenceCorrect] = useState(false)
  const [userDef, setUserDef]         = useState('')
  const [points, setPoints]           = useState(0)
  const [checking, setChecking]       = useState(false)
  const [defCorrect, setDefCorrect]   = useState<boolean | null>(null)
  const [streak, setStreak]           = useState(0)

  useEffect(() => {
    setAlreadyDone(hasDoneToday())
    setStreak(getStreak().count)
  }, [])

  const sentences = useMemo(() => {
    return [...word.sentences].sort(() => Math.random() - 0.5)
  }, [word])

  const speak = useCallback(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(word.word)
    utt.rate = 0.85
    window.speechSynthesis.speak(utt)
  }, [word])

  const pickSentence = useCallback((i: number) => {
    if (answerResult) return
    const isCorrect = sentences[i]?.correct ?? false
    setSelected(i)
    setSentenceCorrect(isCorrect)
    setAnswerResult(isCorrect ? 'correct' : 'wrong')
    if (navigator.vibrate) navigator.vibrate(isCorrect ? [10, 50, 10] : [80])
    setTimeout(() => {
      if (isCorrect) setStage('definition')
      else { playWrong(); setPoints(0); setStage('result'); markDailyDone(); setStreak(getStreak().count) }
    }, 1200)
  }, [answerResult, sentences])

  const submitDefinition = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.word, definition: userDef, actualDefinition: word.definition }),
      })
      const { correct } = await res.json()
      const earned = correct ? 10 : 3
      if (correct) playCorrect(); else playWrong()
      setDefCorrect(correct)
      setPoints(earned)
      setStage('result')
      const updated = markDailyDone()
      setStreak(updated.count)
    } catch {
      playWrong()
      setDefCorrect(null)
      setPoints(3)
      setStage('result')
      const updated = markDailyDone()
      setStreak(updated.count)
    } finally {
      setChecking(false)
    }
  }, [word, userDef])

  const resultExpression = !sentenceCorrect ? 'disappointed' : defCorrect === true ? 'happy' : 'idle'

  if (alreadyDone && stage !== 'result') {
    return (
      <AppShell>
        <div className={styles.screen}>
          <div className={styles.resultRoshi}>
            <RoshiDisplay expression="idle" size={140} />
          </div>
          <SpeechBubble tail="top">
            <div className={styles.pointsBadge}>{streak} day streak</div>
            <div className={styles.pointsLabel}>you already did today&apos;s word. come back tomorrow.</div>
            <div className={styles.definitionReveal}>
              <div className={styles.definitionWordRow}>
                <div className={styles.definitionWord}>{word.word}</div>
                <StarButton word={word.word} definition={word.definition} />
              </div>
              <div className={styles.definitionText}>{word.definition}</div>
            </div>
          </SpeechBubble>
          <Link href="/" style={{ display: 'block' }}>
            <Button variant="subtle">Back to home</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

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

        <div className={styles.eyebrow}>Roshi&apos;s Daily</div>
        {streak > 0 && stage !== 'result' && (
          <div className={styles.streakBadge}>{streak} day streak 🔥</div>
        )}

        {stage === 'sentence' && (
          <>
            <div className={styles.heroWordRow}>
              <button className={styles.speakBtn} onClick={speak} aria-label="Pronounce word">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="currentColor"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className={styles.heroWord}>{word.word}</div>
            </div>
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
          <div className={styles.defStage}>
            <div className={styles.defPrompt}>
              Define <strong>{word.word}</strong> in your own words.
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
              maxLength={200}
            />
            <div className={styles.defHint}>Plain English is fine.</div>
            <Button onClick={submitDefinition} disabled={userDef.trim().length < 4 || checking}>
              {checking ? 'Checking…' : 'Submit'}
            </Button>
          </div>
        )}

        {stage === 'result' && (
          <>
            <div className={styles.resultRoshi}>
              <RoshiDisplay expression={resultExpression} size={140} />
            </div>
            <SpeechBubble tail="top">
              <div className={styles.pointsBadge}>+{points}</div>
              <div className={styles.pointsLabel}>
                {!sentenceCorrect ? 'Better luck next time.' : defCorrect === true ? 'You nailed it.' : 'Close, but not quite.'}
              </div>
              {streak > 0 && <div className={styles.streakLine}>{streak} day streak 🔥</div>}
              <div className={styles.definitionReveal}>
                <div className={styles.definitionWord}>{word.word}</div>
                <div className={styles.definitionText}>{word.definition}</div>
              </div>
            </SpeechBubble>
            <Link href={`/dare/new?word=${encodeURIComponent(word.word)}`} style={{ display: 'block' }}>
              <Button>Dare someone</Button>
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
