import fs from 'fs'
import path from 'path'
import type { GREWord } from '@/lib/gre-words'
import NewDareClient from './NewDareClient'

export const dynamic = 'force-dynamic'

function loadLevel1(): GREWord[] {
  try {
    const p = path.join(process.cwd(), 'public/data/gre-level-1.json')
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as GREWord[]
  } catch { return [] }
}

export default function NewDarePage({ searchParams }: { searchParams: { word?: string } }) {
  const words = loadLevel1()
  return <NewDareClient words={words} preselectedWord={searchParams.word ?? null} />
}
