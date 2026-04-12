'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import RoshiDisplay from '@/components/mascot/RoshiDisplay'
import SpeechBubble from '@/components/ui/SpeechBubble'
import { completedInLevel, markWordComplete, nextWordInLevel } from '@/lib/progress'
import { playCorrect, playWrong } from '@/lib/audio'
import StarButton from '@/components/ui/StarButton'
import type { GREWord } from '@/lib/gre-words'
import styles from './play.module.css'

const WORDS_PER_LEVEL = 100

type Stage = 'sentence' | 'definition' | 'result'

interface Props {
  level: number
  words: GREWord[]
}

export default function PlayClient({ level, words }: Props) {
  const allWordNames = words.map(w => w.word)

  const [currentWord, setCurrentWord] = useState<GREWord | null>(() => {
    const next = nextWordInLevel(allWordNames, level)
    return next ? (words.find(w => w.word === next) ?? null) : null
  })

  const [completed]          = useState(() => completedInLevel(level).length)
  const [stage, setStage]    = useState<Stage>('sentence')
  const [selected, setSelected]   = useState<number | null>(null)
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null)
  const [sentenceCorrect, setSentenceCorrect] = useState(false)
  const [userDef, setUserDef]     = useState('')
  const [points, setPoints]       = useState(0)
  const [checking, setChecking]   = useState(false)
  const [defCorrect, setDefCorrect] = useState<boolean | null>(null)
  const [wordsDoneThisSession, setWordsDoneThisSession] = useState(0)

  // Shuffle sentences once per word so correct answer isn't always first
  const sentences = useMemo(() => {
    if (!currentWord) return []
    return [...currentWord.sentences].sort(() => Math.random() - 0.5)
  }, [currentWord])

  const speak = useCallback(() => {
    if (!currentWord || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(currentWord.word)
    utt.rate = 0.85
    window.speechSynthesis.speak(utt)
  }, [currentWord])

  const pickSentence = useCallback((i: number) => {
    if (answerResult || !currentWord) return
    const isCorrect = sentences[i]?.correct ?? false
    setSelected(i)
    setSentenceCorrect(isCorrect)
    setAnswerResult(isCorrect ? 'correct' : 'wrong')
    if (navigator.vibrate) navigator.vibrate(isCorrect ? [10, 50, 10] : [80])
    setTimeout(() => {
      if (isCorrect) {
        setStage('definition')
      } else {
        playWrong()
        setPoints(0)
        markWordComplete(currentWord.word, level)
        setWordsDoneThisSession(n => n + 1)
        setStage('result')
      }
    }, 1200)
  }, [answerResult, currentWord, sentences, level])

  const submitDefinition = useCallback(async () => {
    if (!currentWord) return
    setChecking(true)
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentWord.word, definition: userDef, actualDefinition: currentWord.definition }),
      })
      const { correct } = await res.json()
      const earned = correct ? 10 : 3
      if (correct) playCorrect(); else playWrong()
      setDefCorrect(correct)
      setPoints(earned)
      markWordComplete(currentWord.word, level)
      setWordsDoneThisSession(n => n + 1)
      setStage('result')
    } catch {
      playWrong()
      setDefCorrect(null)
      setPoints(3)
      markWordComplete(currentWord.word, level)
      setWordsDoneThisSession(n => n + 1)
      setStage('result')
    } finally {
      setChecking(false)
    }
  }, [currentWord, userDef])

  const handleNext = useCallback(() => {
    if (!currentWord) return
    const next = nextWordInLevel(allWordNames, level)
    const nextWord = next ? words.find(w => w.word === next) ?? null : null

    setCurrentWord(nextWord)
    setStage('sentence')
    setSelected(null)
    setAnswerResult(null)
    setSentenceCorrect(false)
    setUserDef('')
    setPoints(0)
    setDefCorrect(null)
  }, [currentWord, allWordNames, words, level])

  const totalCompleted = completed + wordsDoneThisSession
  const pct = Math.round((totalCompleted / WORDS_PER_LEVEL) * 100)
  const resultExpression = !sentenceCorrect ? 'disappointed' : defCorrect === true ? 'happy' : 'idle'

  // Level complete
  if (!currentWord && wordsDoneThisSession > 0) {
    return (
      <AppShell>
        <div className={styles.screen}>
          <div className={styles.resultRoshi}>
            <RoshiDisplay expression="happy" size={140} />
          </div>
          <SpeechBubble tail="top">
            <div className={styles.pointsBadge}>Mission {level} complete.</div>
            <div className={styles.pointsLabel}>You cracked all {WORDS_PER_LEVEL} words. Not bad at all.</div>
          </SpeechBubble>
          <Link href="/" style={{ display: 'block' }}>
            <Button>Back to home</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  // No words available (all done before this session)
  if (!currentWord) {
    return (
      <AppShell>
        <div className={styles.screen}>
          <div className={styles.resultRoshi}>
            <RoshiDisplay expression="happy" size={140} />
          </div>
          <SpeechBubble tail="top">
            <div className={styles.pointsLabel}>You&apos;ve already completed Mission {level}.</div>
          </SpeechBubble>
          <Link href="/" style={{ display: 'block' }}>
            <Button>Back to home</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className={styles.screen}>

        {/* ── Top bar: progress ── */}
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.progressCount}>{totalCompleted}/{WORDS_PER_LEVEL}</span>
        </div>

        {/* ── Stage indicator ── */}
        {stage !== 'result' && (
          <div className={styles.stageRow}>
            <div className={[styles.stagePip, styles.stageActive].join(' ')} />
            <div className={styles.stageLine} />
            <div className={[styles.stagePip, stage === 'definition' ? styles.stageActive : styles.stageDim].join(' ')} />
          </div>
        )}

        {/* ── SENTENCE STAGE ── */}
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
              <div className={styles.heroWord}>{currentWord.word}</div>
            </div>
            <div className={styles.mcqPrompt}>Which sentence(s) use this word correctly?</div>
            <div className={styles.options}>
              {sentences.map((s, i) => {
                const isSelected = selected === i
                const isCorrect  = answerResult && isSelected && s.correct
                const isWrong    = answerResult && isSelected && !s.correct
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
          <div className={styles.defStage}>
            <div className={styles.defPrompt}>
              Define <strong>{currentWord.word}</strong> in your own words.
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

        {/* ── RESULT STAGE ── */}
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
              <div className={styles.definitionReveal}>
                <div className={styles.definitionWordRow}>
                  <div className={styles.definitionWord}>{currentWord.word}</div>
                  <StarButton word={currentWord.word} definition={currentWord.definition} />
                </div>
                <div className={styles.definitionText}>{currentWord.definition}</div>
              </div>
            </SpeechBubble>
            <Button onClick={handleNext}>Next word</Button>
            <Link href="/dare/new" style={{ display: 'block' }}>
              <Button variant="subtle">Dare someone</Button>
            </Link>
          </>
        )}

      </div>
    </AppShell>
  )
}
