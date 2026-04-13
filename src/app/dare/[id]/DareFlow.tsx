'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import RoshiDisplay from '@/components/mascot/RoshiDisplay'
import SpeechBubble from '@/components/ui/SpeechBubble'
import { createClient } from '@/lib/supabase'
import { playCorrect, playWrong } from '@/lib/audio'
import StarButton from '@/components/ui/StarButton'
import type { Dare } from '@/lib/mock'
import type { Sentence } from '@/lib/gre-words'
import styles from './dare.module.css'

type Stage = 'sentence' | 'definition' | 'result'

const SENTENCE_TIME  = 30
const DEFINITION_TIME = 60

interface DareFlowProps {
  dare:             Dare
  sentences:        Sentence[]
  definition:       string | null
  dareId:           string
  isChallengee:     boolean
  hasTrap:          boolean
  challengerName:   string
  challengerUserId: string
}

export default function DareFlow({ dare, sentences, definition, dareId, isChallengee, hasTrap, challengerName, challengerUserId }: DareFlowProps) {
  const [stage, setStage]                     = useState<Stage>('sentence')
  const [selected, setSelected]               = useState<number | null>(null)
  const [answerResult, setAnswerResult]       = useState<'correct' | 'wrong' | null>(null)
  const [sentenceCorrect, setSentenceCorrect] = useState(false)
  const [userDef, setUserDef]                 = useState('')
  const [points, setPoints]                   = useState(0)
  const [checking, setChecking]               = useState(false)
  const [defCorrect, setDefCorrect]           = useState<boolean | null>(null)
  const [trapWinner, setTrapWinner]           = useState<'trapper' | 'target' | null>(null)
  const [timeLeft, setTimeLeft]               = useState(SENTENCE_TIME)
  const timerRef                              = useRef<ReturnType<typeof setInterval> | null>(null)
  const timedOut                              = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  // Start/reset timer when stage changes
  useEffect(() => {
    if (stage === 'result') { clearTimer(); return }
    timedOut.current = false
    const limit = stage === 'sentence' ? SENTENCE_TIME : DEFINITION_TIME
    setTimeLeft(limit)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); timerRef.current = null; return 0 }
        return prev - 1
      })
    }, 1000)
    return clearTimer
  }, [stage, clearTimer])

  // Auto-fail on timeout
  useEffect(() => {
    if (timeLeft !== 0 || stage === 'result' || timedOut.current) return
    timedOut.current = true
    playWrong()
    if (navigator.vibrate) navigator.vibrate([80])
    if (stage === 'sentence') {
      setPoints(0)
      setStage('result')
      saveDareResult(0)
    } else {
      // Got sentence right but timed out on definition — counts as 0
      setDefCorrect(false)
      setPoints(0)
      setStage('result')
      saveDareResult(0)
    }
  }, [timeLeft, stage, saveDareResult])

  const pickSentence = useCallback((i: number) => {
    if (answerResult) return
    clearTimer()
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
        setStage('result')
        saveDareResult(0)
      }
    }, 1200)
  }, [answerResult, sentences, clearTimer, saveDareResult])

  const saveDareResult = useCallback(async (earned: number) => {
    const supabase = createClient()
    // Challenger earns 10 pts if they stumped the receiver (0 pts), 5 pts otherwise
    const trapResult = hasTrap ? (earned === 10 ? 'target' : 'trapper') : null
    if (hasTrap && trapResult) setTrapWinner(trapResult)
    const update = isChallengee
      ? {
          to_points:   earned,
          from_points: earned === 0 ? 10 : 5,
          status:      'complete',
          ...(hasTrap ? { trap_winner: trapResult } : {}),
        }
      : { from_points: earned, status: 'complete' }
    await supabase.from('dares').update(update).eq('id', dareId)

    // Notify the challenger that the dare was completed (only when challengee finishes)
    if (isChallengee && challengerUserId) {
      const resultMsg = earned === 0
        ? `${dare.to} failed. Embarrassing, really.`
        : earned === 10
          ? `${dare.to} got it right. Apparently they do know words.`
          : `${dare.to} half-answered. Not terrible. Not good either.`
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: challengerUserId,
          title: `${dare.to} took your dare.`,
          body: resultMsg,
          url: `/dare/${dareId}`,
        }),
      })
    }
  }, [dareId, isChallengee, hasTrap, challengerUserId, dare.to, dare.word])

  const submitDefinition = useCallback(async () => {
    clearTimer()
    setChecking(true)
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: dare.word, definition: userDef, actualDefinition: definition }),
      })
      const { correct } = await res.json()
      const earned = correct ? 10 : 3
      if (correct) playCorrect(); else playWrong()
      setDefCorrect(correct)
      setPoints(earned)
      setStage('result')
      await saveDareResult(earned)
    } catch {
      playWrong()
      setDefCorrect(null)
      setPoints(3)
      setStage('result')
      await saveDareResult(3)
    } finally {
      setChecking(false)
    }
  }, [dare.word, userDef, saveDareResult, clearTimer])

  const resultExpression = !sentenceCorrect ? 'disappointed' : defCorrect === true ? 'happy' : 'idle'

  return (
    <AppShell gameplay>
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
            <div className={[styles.timer, timeLeft <= 10 ? styles.timerUrgent : ''].filter(Boolean).join(' ')}>
              {timeLeft}
            </div>
          </div>
        )}

        {stage === 'sentence' && (
          <>
            <div className={styles.eyebrow}>The Dare</div>
            <div className={styles.challenger}>
              {dare.from} challenged you{hasTrap && isChallengee && <span className={styles.trapBadge}> · 🪤 trap set</span>}
            </div>
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
          <div className={styles.defStage}>
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
              <div className={styles.pointsBadge}>+{points}{hasTrap && trapWinner === 'target' ? ' +10 🪤' : ''}</div>
              <div className={styles.pointsLabel}>
                {!sentenceCorrect
                  ? 'Better luck next time.'
                  : defCorrect === true
                    ? 'You nailed it.'
                    : 'Close, but not quite.'}
              </div>
              {hasTrap && trapWinner && (
                <div className={styles.trapReveal}>
                  {trapWinner === 'target'
                    ? `🪤 Trap beaten! ${challengerName} gets nothing.`
                    : `🪤 Trap triggered. ${challengerName} gets +10 pts.`}
                </div>
              )}
              {definition && (
                <div className={styles.definitionReveal}>
                  <div className={styles.definitionWordRow}>
                    <div className={styles.definitionWord}>{dare.word}</div>
                    <StarButton word={dare.word} definition={definition} />
                  </div>
                  <div className={styles.definitionText}>{definition}</div>
                </div>
              )}
            </SpeechBubble>

            <div className={styles.actionRow}>
              <Link href={`/dare/new?word=${encodeURIComponent(dare.word)}`} className={styles.actionPill}>
                ⚡ {dare.from === 'Roshi' ? 'Send dare' : 'Dare back'}
              </Link>
              <Link href={`/dare/trap?word=${encodeURIComponent(dare.word)}`} className={[styles.actionPill, styles.actionPillTrap].join(' ')}>
                🪤 Set trap
              </Link>
            </div>

            <Link href="/" style={{ display: 'block', marginTop: 8 }}>
              <Button variant="subtle">Back to home</Button>
            </Link>
          </>
        )}

      </div>
    </AppShell>
  )
}
