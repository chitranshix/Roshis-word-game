import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import PlayClient from './PlayClient'

interface Props { params: Promise<{ level: string }> }

export default async function PlayPage({ params }: Props) {
  const { level } = await params
  const levelNum = parseInt(level, 10)
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 11) notFound()

  let words: unknown
  try {
    const filePath = path.join(process.cwd(), `public/data/gre-level-${levelNum}.json`)
    words = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    notFound()
  }

  return <PlayClient level={levelNum} words={words as Parameters<typeof PlayClient>[0]['words']} />
}
