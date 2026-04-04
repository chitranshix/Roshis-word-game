<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Roshi — Developer Guide

## What is this?

A vocabulary word-dare game. Players dare friends with words they know; friends dare back. Each dare is a two-step challenge: pick the correct sentence using the word, then define it in your own words. AI (Claude Haiku) grades definitions.

## Commands

```bash
npm run dev    # Dev server at localhost:3000
npm run build  # Production build
npm run lint   # ESLint — primary code quality check
```

## Architecture

### Pages
| Route | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Home feed — daily word + dare list |
| `/onboarding` | `src/app/onboarding/page.tsx` | 4-slide onboarding with Roshi |
| `/dare/new` | `src/app/dare/new/page.tsx` | Create a dare — pick word + friend |
| `/dare/[id]` | `src/app/dare/[id]/DareFlow.tsx` | Play a dare — MCQ + definition |
| `/daily` | redirects to `/dare/[id]` | Daily word challenge |

### Key files
- `src/lib/mock.ts` — all mock data (replace with Supabase later)
- `src/app/api/evaluate/route.ts` — Claude Haiku definition grader
- `src/components/layout/AppShell.tsx` — main shell with sticky header
- `src/components/mascot/RoshiDisplay.tsx` — static turtle SVG (idle/happy)
- `src/components/ui/ThemeToggle.tsx` — mountain/ocean theme pill

### Fonts (3 only — do not add more)
| Variable | Font | Used for |
|---|---|---|
| `--font-logo` | Shizuru | Logo text only |
| `--font-roshi` | Kiwi Maru | Roshi's speech bubbles, feedback bar, points result |
| `--font-ui` | DM Sans | Everything else — UI, words, labels |

### Themes
- **Light** = "Play on land" — parchment (`#f2e8d5` bg)
- **Dark** = "Play in water" — midnight blue (`#0f1729` bg)
- Toggle is always visible in the header on all screens

### Design system
- **Spacing scale**: 4 / 8 / 12 / 16 / 20 / 28px
- **Cards**: `var(--surface)` + `1px var(--border)` + `var(--radius-lg)`
- **Words**: `var(--accent)` color, `font-weight: 700`, DM Sans
- **Section labels**: `11px 600 uppercase var(--muted)` — always outside cards, never inside
- **Transitions**: `0.15s` everywhere, no `ease` suffix needed
- No gradients, no box-shadows on fills

### Responsive
- Mobile (< 768px): single column, 430px max-width centered
- Desktop (≥ 768px): full-width shell, 1100px content, 2-column grid on home

### State
- `localStorage.roshi_name` — player name (set in onboarding)
- `next-themes` — persists light/dark preference
- No auth for MVP — all data is mock

### API
- `POST /api/evaluate` — body: `{ word, definition }` — returns `{ correct: bool, points: 0|3|5 }`
- Uses `claude-haiku-4-5`, max 10 tokens, yes/no response
- Requires `ANTHROPIC_API_KEY` in `.env.local`
