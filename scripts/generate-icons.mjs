import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

// Roshi's face SVG — idle expression with leaf
const faceSvg = (size) => `
<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="100" height="100" rx="22" fill="#0d1525"/>

  <!-- Head -->
  <circle cx="50" cy="47" r="28" fill="#5CB828" stroke="#1A1A08" stroke-width="1.5"/>

  <!-- Left eye white -->
  <circle cx="40" cy="42" r="9" fill="white" stroke="#1A1A08" stroke-width="1.2"/>
  <!-- Right eye white -->
  <circle cx="60" cy="40" r="8" fill="white" stroke="#1A1A08" stroke-width="1.2"/>

  <!-- Droopy upper lids -->
  <path d="M31 39 Q40 32 49 39" fill="#5CB828" stroke="#1A1A08" stroke-width="1"/>
  <path d="M52 37 Q60 30 68 37" fill="#5CB828" stroke="#1A1A08" stroke-width="1"/>

  <!-- Pupils -->
  <circle cx="41" cy="45" r="5" fill="#1A1A08"/>
  <circle cx="61" cy="43" r="4.5" fill="#1A1A08"/>

  <!-- Eye highlights -->
  <circle cx="43" cy="42" r="2" fill="white"/>
  <circle cx="63" cy="40" r="1.8" fill="white"/>

  <!-- Mouth smirk -->
  <path d="M38 61 Q50 70 63 61" stroke="#1A1A08" stroke-width="1.8" fill="none" stroke-linecap="round"/>

  <!-- Leaf -->
  <path d="M48 63 Q62 48 74 53 Q70 67 48 63Z" fill="#4DB330" stroke="#2D8018" stroke-width="0.8"/>
  <path d="M51 61 Q62 50 72 55" stroke="#2D8018" stroke-width="0.5" fill="none" opacity="0.7"/>
</svg>
`

async function generate() {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(faceSvg(size)))
      .png()
      .toFile(resolve(publicDir, `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }

  // favicon.ico (32x32)
  await sharp(Buffer.from(faceSvg(32)))
    .png()
    .toFile(resolve(publicDir, 'favicon.png'))
  console.log('Generated favicon.png')
}

generate().catch(console.error)
