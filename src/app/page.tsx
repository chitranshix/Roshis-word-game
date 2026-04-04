import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import RoshiDisplay from '@/components/mascot/RoshiDisplay'
import { MOCK_DAILY, MOCK_DARES, MOCK_PLAYER } from '@/lib/mock'
import styles from './page.module.css'

export default function Home() {
  const pendingDares   = MOCK_DARES.filter(d => d.status === 'pending_you')
  const otherDares     = MOCK_DARES.filter(d => d.status !== 'pending_you')
  const recentDares    = otherDares.slice(0, 3)
  const hasMoreDares   = otherDares.length > 3
  const youCompleted   = MOCK_DAILY.completedBy.find(c => c.name === MOCK_PLAYER)
  const totalAttempted = MOCK_DAILY.completedBy.length
  const avgScore       = totalAttempted === 0 ? 0 : MOCK_DAILY.completedBy.reduce((s, c) => s + c.points, 0) / totalAttempted
  const difficulty     = totalAttempted === 0 ? '—' : avgScore >= 4 ? 'easy' : avgScore >= 2.5 ? 'medium' : 'hard'

  return (
    <AppShell>
      <div className={styles.grid}>

        {/* ── Today's word ── */}
        <div className={`${styles.section} ${styles.gridFull}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Today&apos;s word</span>
          </div>
          <div className={styles.card}>
            <div className={styles.cardInner}>
              <div className={styles.cardLeft}>
                <div className={styles.word}>{MOCK_DAILY.word}</div>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statNum}>{totalAttempted}</span>
                    <span className={styles.statLabel}>played</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                    <span className={styles.statNum}>{difficulty}</span>
                    <span className={styles.statLabel}>difficulty</span>
                  </div>
                </div>
                <Link href="/daily" className={styles.playBtn}>Play with Roshi</Link>
              </div>
              <div className={styles.cardRoshi}>
                <RoshiDisplay expression={youCompleted ? 'happy' : 'idle'} size={90} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Your turn ── */}
        {pendingDares.length > 0 && (
          <div className={`${styles.section} ${styles.gridLeft}`}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Your turn</span>
              <span className={styles.sectionBadge}>{pendingDares.length}</span>
            </div>
            <div className={styles.chipRow}>
              {pendingDares.map(dare => (
                <Link key={dare.id} href={`/dare/${dare.id}`} className={styles.chip}>
                  <div className={styles.chipTop}>
                    <img className={styles.avatar} src={`https://api.dicebear.com/9.x/thumbs/svg?backgroundColor=transparent&seed=${encodeURIComponent(dare.from)}`} alt={dare.from} />
                    <span className={styles.chipFrom}>{dare.from}</span>
                  </div>
                  <div className={styles.chipWord}>???</div>
                  <div className={styles.chipMeta}>{dare.sentAt}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Dares ── */}
        {otherDares.length > 0 && (
          <div className={`${styles.section} ${styles.gridRight}`}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Dares</span>
              {hasMoreDares && <Link href="/dares" className={styles.seeAll}>See all →</Link>}
            </div>
            {recentDares.map(dare => {
              const isWaiting  = dare.status === 'pending_them'
              const isComplete = dare.status === 'complete'
              const fromLine   = isWaiting ? `You dared ${dare.to}` : `${dare.from} dared you`
              const pts        = dare.yourPoints ?? dare.theirPoints
              const who        = dare.yourPoints ? 'You' : dare.to
              const avatarSeed = isWaiting ? dare.to : dare.from

              return (
                <div key={dare.id} className={[styles.card, styles.dareRow, isComplete ? styles.dimmed : ''].join(' ')}>
                  <img className={styles.avatarMd} src={`https://api.dicebear.com/9.x/thumbs/svg?backgroundColor=transparent&seed=${encodeURIComponent(avatarSeed)}`} alt={avatarSeed} />
                  <div className={styles.dareInfo}>
                    <div className={styles.word}>{dare.word}</div>
                    <div className={styles.dareMeta}>{fromLine} · {dare.sentAt}</div>
                  </div>
                  <div>
                    {isWaiting  && <span className={`${styles.tag} ${styles.tagMuted}`}>Waiting</span>}
                    {isComplete && <span className={`${styles.tag} ${styles.tagDone}`}>{who} +{pts}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* ── FAB ── */}
      <Link href="/dare/new" className={styles.fab}>+ Dare someone</Link>

    </AppShell>
  )
}
