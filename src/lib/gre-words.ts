/**
 * GRE word list utility.
 * 4,804 words across 11 levels, split into per-level JSON files
 * (public/data/gre-level-N.json) for fast loading.
 * Each word has a definition and 4 sentences (1 correct, 3 distractors).
 */

export interface Sentence {
  sentence: string
  correct: boolean
}

export interface GREWord {
  word: string
  definition: string
  level: number
  sentences: Sentence[]
}

const _levelCache: Map<number, GREWord[]> = new Map()

export async function getGRELevel(level: number): Promise<GREWord[]> {
  if (_levelCache.has(level)) return _levelCache.get(level)!
  const res = await fetch(`/data/gre-level-${level}.json`)
  const words = await res.json() as GREWord[]
  _levelCache.set(level, words)
  return words
}

export function getWordByName(words: GREWord[], word: string): GREWord | undefined {
  return words.find(w => w.word === word)
}

/** Pick a random word from a level (for daily word / dare creation) */
export function randomWordFromLevel(words: GREWord[]): GREWord {
  return words[Math.floor(Math.random() * words.length)]
}
