import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import { MOCK_DAILY, MOCK_DARES, MOCK_PLAYER } from '@/lib/mock'
import styles from './page.module.css'

export default function Home() {
  return (
    <AppShell>

      {/* ── Daily Word ── */}
      <div className={styles.dailyCard}>
        <div className={styles.dailyLabel}>Today's Word</div>
        <div className={styles.dailyWord}>{MOCK_DAILY.word}</div>

        <div className={styles.friendDots}>
          {MOCK_DAILY.allPlayers.map(name => {
            const result  = MOCK_DAILY.completedBy.find(c => c.name === name)
            const isYou   = name === MOCK_PLAYER
            const label   = isYou ? 'You' : name
            return (
              <div key={name} className={styles.friendDot}>
                <div className={[styles.dot, result ? styles.done : ''].join(' ')}>
                  {label.slice(0, 2)}
                </div>
                <div className={styles.dotName}>{label}</div>
                {result && (
                  <div className={styles.dotPoints}>+{result.points}</div>
                )}
              </div>
            )
          })}
        </div>

        <Link href="/daily">
          <Button>Play today's word →</Button>
        </Link>
      </div>

      {/* ── Dare feed ── */}
      {MOCK_DARES.map(dare => {
        const isYourTurn = dare.status === 'pending_you'
        const isWaiting  = dare.status === 'pending_them'
        const isComplete = dare.status === 'complete'

        const fromLine = isYourTurn || isComplete && dare.from !== MOCK_PLAYER
          ? `${dare.from} dared you`
          : isWaiting || isComplete && dare.from === MOCK_PLAYER
          ? `You dared ${dare.to}`
          : ''

        let badgeText  = ''
        let badgeStyle = ''
        let metaText   = dare.sentAt

        if (isYourTurn) {
          badgeText  = 'Your turn'
          badgeStyle = styles.yours
        } else if (isWaiting) {
          badgeText  = 'Waiting'
        } else if (isComplete) {
          const pts = dare.yourPoints ?? dare.theirPoints
          const who = dare.yourPoints ? 'You' : dare.to
          badgeText  = `${who} got +${pts}`
          badgeStyle = styles.won
          metaText   = dare.sentAt
        }

        const cardClass = [
          styles.dareCard,
          isYourTurn ? styles.urgent   : '',
          isComplete  ? styles.complete : '',
        ].join(' ')

        const wordDisplay = isYourTurn
          ? '??? '               // hidden — suspense
          : dare.word           // visible for sent/completed

        const inner = (
          <div className={cardClass}>
            <div className={styles.dareTop}>
              <div className={styles.dareFrom}>{fromLine}</div>
              {badgeText && (
                <div className={[styles.dareBadge, badgeStyle].join(' ')}>
                  {badgeText}
                </div>
              )}
            </div>
            <div className={[styles.dareWord, isYourTurn ? styles.hidden : ''].join(' ')}>
              {wordDisplay}
            </div>
            <div className={styles.dareBottom}>
              <div className={styles.dareMeta}>{metaText}</div>
              {isYourTurn && <div className={styles.goArrow}>→</div>}
            </div>
          </div>
        )

        return isYourTurn
          ? <Link key={dare.id} href={`/dare/${dare.id}`}>{inner}</Link>
          : <div key={dare.id}>{inner}</div>
      })}

      {/* ── Dare someone ── */}
      <Link href="/dare/new" style={{ display: 'block' }}>
        <Button variant="ghost">+ Dare someone</Button>
      </Link>

    </AppShell>
  )
}
