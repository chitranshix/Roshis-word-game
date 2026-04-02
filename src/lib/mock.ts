// Temporary mock data — replace with Supabase queries later

export type DareStatus = 'pending_you' | 'pending_them' | 'complete'

export interface Dare {
  id: string
  word: string
  from: string
  to: string
  status: DareStatus
  sentAt: string
  yourPoints?: number   // points you earned (if complete, pending_you path)
  theirPoints?: number  // points they earned (if complete, pending_them path)
}

export interface DailyWord {
  word: string
  completedBy: { name: string; points: number }[]
  allPlayers: string[]
}

export const MOCK_PLAYER = 'Aashu'

export const MOCK_DAILY: DailyWord = {
  word: 'pellucid',
  completedBy: [
    { name: 'Sam',  points: 5 },
    { name: 'Alex', points: 3 },
  ],
  allPlayers: ['Sam', 'Alex', 'Priya', MOCK_PLAYER],
}

export const MOCK_DARES: Dare[] = [
  { id: 'd1', word: 'loquacious', from: 'Sam',        to: MOCK_PLAYER, status: 'pending_you',  sentAt: '2h ago' },
  { id: 'd3', word: 'luminous',   from: 'Priya',      to: MOCK_PLAYER, status: 'pending_you',  sentAt: '1d ago' },
  { id: 'd2', word: 'ephemeral',  from: MOCK_PLAYER,  to: 'Alex',      status: 'pending_them', sentAt: '6h ago' },
  { id: 'd4', word: 'solipsism',  from: MOCK_PLAYER,  to: 'Sam',       status: 'complete',     sentAt: '2d ago', theirPoints: 5 },
  { id: 'd5', word: 'avarice',    from: 'Priya',      to: MOCK_PLAYER, status: 'complete',     sentAt: '3d ago', yourPoints: 3 },
]

export const MOCK_SENTENCES: Record<string, { sentence: string; correct: boolean }[]> = {
  pellucid: [
    { sentence: 'The pellucid waters of the lagoon revealed every stone below.', correct: true },
    { sentence: 'His pellucid temper made everyone nervous around him.', correct: false },
    { sentence: 'She wore a pellucid expression, impossible to read.', correct: false },
    { sentence: 'The pellucid darkness of the cave pressed in from all sides.', correct: false },
  ],
  loquacious: [
    { sentence: 'The loquacious man sat in silence all evening.', correct: false },
    { sentence: 'She was loquacious, never pausing her stream of stories.', correct: true },
    { sentence: 'The loquacious path wound through the forest slowly.', correct: false },
    { sentence: 'He gave a short, loquacious nod and left the room.', correct: false },
  ],
  luminous: [
    { sentence: 'The cave was luminous, utterly dark and cold.', correct: false },
    { sentence: 'Her luminous eyes caught the light as she smiled.', correct: true },
    { sentence: 'He spoke in a luminous, barely audible whisper.', correct: false },
    { sentence: 'The luminous stone sank slowly to the riverbed.', correct: false },
  ],
}
