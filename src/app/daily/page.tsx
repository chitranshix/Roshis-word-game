import { MOCK_DAILY, MOCK_SENTENCES, MOCK_DEFINITIONS } from '@/lib/mock'
import DareFlow from '@/app/dare/[id]/DareFlow'

const DAILY_DARE = {
  id:     'daily',
  word:   MOCK_DAILY.word,
  from:   'Roshi',
  to:     'You',
  status: 'pending_you' as const,
  sentAt: 'today',
}

export default function DailyPage() {
  const sentences  = MOCK_SENTENCES[MOCK_DAILY.word] ?? []
  const definition = MOCK_DEFINITIONS[MOCK_DAILY.word] ?? null
  return <DareFlow dare={DAILY_DARE} sentences={sentences} definition={definition} dareId="daily" isChallengee={true} />
}
