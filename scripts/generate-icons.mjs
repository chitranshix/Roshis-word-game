import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

// Roshi's face only — idle expression (droopy lids, rolling eyes, smirk, leaf)
// Original head: circle cx=156 cy=24 r=17, plus neck from ~130,56
// We crop the viewBox tightly around the head+neck: roughly x=120 y=4 w=60 h=58
const SW = 2.2

const faceSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="129 3 52 50" width="${size}" height="${size}">
  <!-- rounded square background — dark theme bg colour -->
  <rect x="129" y="3" width="52" height="50" rx="11" fill="#0a1628"/>

  <!-- neck -->
  <path d="M130,56 Q144,46 152,30" stroke="#5CB828" stroke-width="18" stroke-linecap="round" fill="none"/>
  <path d="M130,56 Q144,46 152,30" stroke="#1A1A08" stroke-width="${SW}" fill="none" stroke-linecap="round"/>

  <!-- head -->
  <circle cx="156" cy="24" r="17" fill="#5CB828" stroke="#1A1A08" stroke-width="${SW}"/>

  <!-- idle eyes — big white circles -->
  <circle cx="150" cy="22" r="8.5" fill="white" stroke="#1A1A08" stroke-width="1.8"/>
  <circle cx="164" cy="20" r="7.5" fill="white" stroke="#1A1A08" stroke-width="1.8"/>
  <!-- droopy upper lids -->
  <path d="M141 19 Q150 13 159 19" fill="#5CB828" stroke="#1A1A08" stroke-width="1.5"/>
  <path d="M156 17 Q164 11 172 17" fill="#5CB828" stroke="#1A1A08" stroke-width="1.5"/>
  <!-- rolling pupils -->
  <circle cx="151" cy="24" r="4.5" fill="#1A1A08"/>
  <circle cx="165" cy="22" r="4"   fill="#1A1A08"/>
  <!-- eye highlights -->
  <circle cx="153" cy="21" r="1.8" fill="white"/>
  <circle cx="167" cy="19" r="1.5" fill="white"/>

  <!-- lazy smirk -->
  <path d="M148 35 Q157 42 167 35" stroke="#1A1A08" stroke-width="2" fill="none" stroke-linecap="round"/>

  <!-- leaf sticking out of mouth -->
  <path d="M155 36 Q166 25 175 29 Q172 39 155 36Z" fill="#4DB330" stroke="#2D8018" stroke-width="1"/>
  <path d="M157 34 Q165 26 172 30" stroke="#2D8018" stroke-width="0.7" fill="none" opacity="0.7"/>
</svg>`

async function generate() {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(faceSvg(size)))
      .png()
      .toFile(resolve(publicDir, `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }
  await sharp(Buffer.from(faceSvg(32)))
    .png()
    .toFile(resolve(publicDir, 'favicon.png'))
  console.log('Generated favicon.png')
}

generate().catch(console.error)
