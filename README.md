# Roshi

A social vocabulary game. Dare your friends to identify and define words you pick — earn points for getting it right.

## How it works

1. Pick a word and dare a friend
2. They see 4 sentences — pick the one that uses the word correctly
3. If correct, they try to define the word in their own words
4. Claude evaluates the definition — 10 pts for a good one, 3 pts for a decent attempt, 0 for wrong

Wrong sentence = no definition attempt, just see the meaning and try again next time.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Anthropic API** (Claude Haiku — definition evaluation)
- **next-themes** (parchment light / midnight blue dark)
- **CSS Modules** throughout, no Tailwind
- **Supabase** — planned, not yet connected (mock data in `src/lib/mock.ts`)

## Running locally

```bash
npm install
npm run dev -- -p 3001   # or any port
```

Requires `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

Get an API key at [console.anthropic.com](https://console.anthropic.com).

## Structure

```
src/
  app/
    page.tsx                  # Home feed — daily word + dare cards
    daily/page.tsx            # Daily word challenge
    dare/
      [id]/
        page.tsx              # Dare detail (fetches dare by id)
        DareFlow.tsx          # Full game flow — sentence → definition → result
      new/page.tsx            # Send a dare to a friend
    api/
      evaluate/route.ts       # POST — checks definition correctness via Claude
    onboarding/page.tsx       # Name entry on first visit
  components/
    layout/AppShell.tsx       # Header, theme toggle, onboarding gate
    ui/Button.tsx             # Primary / ghost / subtle variants
  lib/
    mock.ts                   # Placeholder data — replace with Supabase queries
```

## Scoring

| Outcome | Points |
|---|---|
| Wrong sentence | 0 |
| Right sentence + correct definition | 10 |
| Right sentence + wrong definition | 3 |

## Notes

- Player name stored in `localStorage` under `roshi_name` — no auth for MVP
- Themes: parchment (land) and midnight blue (water), toggled with 🏔️ / 🌊
- Definition evaluation uses Claude Haiku — cheap (fractions of a cent per call)
- `DEFINITION_MAP` in `DareFlow.tsx` and `MOCK_SENTENCES` in `mock.ts` are temporary — real definitions and sentence data will come from the database
