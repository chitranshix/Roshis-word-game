import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

// Exact face from Roshi.tsx — idle expression with leaf chew + droopy lids
// Original viewBox coords, head centered at (156,24) r=17
// We scale/translate to fit a 100x100 canvas with ~8px padding
// scale = 38/17 ≈ 2.235, center at (50,50)
// tx = 50 - 156*s, ty = 50 - 24*s
const S = 2.235
const TX = 50 - 156 * S
const TY = 50 - 24 * S
const SW = 2.2 * S  // stroke-width scaled

const faceSvg = (size) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="100" height="100" rx="22" fill="#0d1525"/>

  <g transform="translate(${TX.toFixed(2)}, ${TY.toFixed(2)}) scale(${S})">
    <!-- HEAD -->
    <circle cx="156" cy="24" r="17" fill="#5CB828" stroke="#1A1A08" stroke-width="${(2.2/S).toFixed(2)}"/>

    <!-- EYES — big white circles -->
    <circle cx="150" cy="22" r="8.5" fill="white" stroke="#1A1A08" stroke-width="${(1.8/S).toFixed(2)}"/>
    <circle cx="164" cy="20" r="7.5" fill="white" stroke="#1A1A08" stroke-width="${(1.8/S).toFixed(2)}"/>

    <!-- Droopy upper lids -->
    <path d="M141 19 Q150 13 159 19" fill="#5CB828" stroke="#1A1A08" stroke-width="${(1.5/S).toFixed(2)}"/>
    <path d="M156 17 Q164 11 172 17" fill="#5CB828" stroke="#1A1A08" stroke-width="${(1.5/S).toFixed(2)}"/>

    <!-- Rolling pupils (looking up-right like eye roll) -->
    <circle cx="151" cy="20" r="4.5" fill="#1A1A08"/>
    <circle cx="165" cy="18" r="4"   fill="#1A1A08"/>
    <!-- Eye highlights -->
    <circle cx="153" cy="18" r="1.8" fill="white"/>
    <circle cx="167" cy="16" r="1.5" fill="white"/>

    <!-- Mouth — lazy smirk -->
    <path d="M148 35 Q157 42 167 35" stroke="#1A1A08" stroke-width="${(2/S).toFixed(2)}" fill="none" stroke-linecap="round"/>

    <!-- Leaf sticking out of mouth -->
    <path d="M155 36 Q166 25 175 29 Q172 39 155 36Z" fill="#4DB330" stroke="#2D8018" stroke-width="${(1/S).toFixed(2)}"/>
    <path d="M157 34 Q165 26 172 30" stroke="#2D8018" stroke-width="${(0.7/S).toFixed(2)}" fill="none" opacity="0.7"/>
  </g>
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
