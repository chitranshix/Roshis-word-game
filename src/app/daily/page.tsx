import { MOCK_DAILY } from '@/lib/mock'
import DareFlow from '@/app/dare/[id]/DareFlow'

// Reuse the dare flow with a synthetic daily dare object
const DAILY_DARE = {
  id:      'daily',
  word:    MOCK_DAILY.word,
  from:    'Roshi',        // the daily word is "from Roshi"
  to:      'You',
  status:  'pending_you' as const,
  sentAt:  'today',
}

export default function DailyPage() {
  return <DareFlow dare={DAILY_DARE} />
}
