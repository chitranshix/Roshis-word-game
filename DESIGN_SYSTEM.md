# Roshi Design System

> Living document. Update when new patterns are introduced or decisions change.

---

## Typography

| Role | Size | Weight | Color | Other |
|------|------|--------|-------|-------|
| Page heading | 20px | 700 | `var(--text)` | `letter-spacing: -0.02em` |
| Section label | 11px | 700 | `var(--muted)` | `uppercase`, `letter-spacing: 0.09em` |
| Word | 16px | 700 | `var(--accent)` | `letter-spacing: -0.01em` |
| Body | 15px | 400 | `var(--text)` | `line-height: 1.5` |
| Definition / hint | 13px | 400 | `var(--muted)` | `line-height: 1.4` |
| Sub-label / caption | 11px | 500 | `var(--muted)` | — |

**Fonts:**
- `var(--font-ui)` — DM Sans. Everything except Roshi speech.
- `var(--font-roshi)` — Kiwi Maru. Roshi speech bubbles, feedback bar, points result only.
- `var(--font-logo)` — Shizuru. Logo only.

---

## Colour tokens

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--bg` | `#f2e8d5` | `#0f1729` | Page background |
| `--surface` | `#faf6ef` | `#19253d` | Card / row background |
| `--surface2` | `#ede6d8` | `#212f47` | Pressed state, subtle fill |
| `--border` | `#ddd3c0` | `#2e3f5c` | Borders, dividers |
| `--text` | `#1a1714` | `#e8dfd0` | Primary text |
| `--muted` | `#8c7d6b` | `#7a8fa8` | Labels, hints, placeholders |
| `--accent` | `#a07828` | `#c49a3c` | Words, links, primary action |
| `--gold` | `#c49a3c` | `#c49a3c` | Streak, star icons |
| `--correct` | `#4a8c5c` | `#4a8c5c` | Correct answer |
| `--wrong` | `#c0392b` | `#e05a4a` | Wrong answer, trap |

---

## Spacing scale

`4 / 8 / 12 / 16 / 20 / 28px` — nothing in between.

| Context | Value |
|---------|-------|
| Gap between list rows | `1px` (via background: var(--border) on wrapper) |
| Gap between sections | `20px` |
| Gap between section label and content | `8px` |
| Page bottom padding | `60px` |
| Horizontal page padding | handled by AppShell `.content` — do not add to page component |

---

## Components

### Page heading
```css
font-size: 20px;
font-weight: 700;
color: var(--text);
letter-spacing: -0.02em;
```
Used once per page, at the top. No margin needed — AppShell gap handles spacing.

### Section label
```css
font-size: 11px;
font-weight: 700;
letter-spacing: 0.09em;
text-transform: uppercase;
color: var(--muted);
```
Used above groups of items. Always outside cards, never inside.

---

### Input field
```css
width: 100%;
background: var(--surface);
border: 2px solid var(--border);
border-radius: var(--radius-md);
padding: 14px 16px;
font-size: 16px;
color: var(--text);
transition: border-color 0.15s;

&:focus { outline: none; border-color: var(--accent); }
&::placeholder { color: var(--muted); }
&.error { border-color: var(--wrong); }
```

---

### List (grouped rows)
Wrap rows in a container with `gap: 1px; background: var(--border); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border)`.

Each row:
```css
display: flex;
align-items: center; /* or flex-start for multi-line */
gap: 12px;
padding: 14px 16px;
background: var(--surface);
```

No border-bottom on rows — the 1px gap on the wrapper acts as divider.

---

### Empty state
```css
display: flex;
flex-direction: column;
align-items: center;
gap: 8px;
padding: 40px 20px;
text-align: center;

.emptyText  { font-size: 16px; font-weight: 700; color: var(--text); }
.emptyHint  { font-size: 13px; color: var(--muted); }
```

---

### Action pills (post-result row)
```css
flex: 1;
display: flex;
align-items: center;
justify-content: center;
gap: 6px;
padding: 14px 12px;
border-radius: var(--radius-md);
background: var(--surface2);
border: 2px solid var(--border);
font-size: 15px;
font-weight: 600;
color: var(--text);
text-decoration: none;
white-space: nowrap;
-webkit-tap-highlight-color: transparent;
transition: background 0.15s, border-color 0.15s;

&:active { background: var(--surface); }

/* Trap variant */
&.trap { border-color: var(--wrong); color: var(--wrong); }
&.trap:active { background: color-mix(in srgb, var(--wrong) 10%, var(--surface)); }
```

---

### Word + definition reveal (result screens)
```css
.definitionReveal {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0 4px;
  border-top: 1px solid var(--border);
  margin-top: 6px;
  width: 100%;
}
.definitionWord { font-size: 17px; font-weight: 700; color: var(--text); }
.definitionPos  { font-size: 11px; font-style: italic; color: var(--muted); }
.definitionText { font-size: 14px; line-height: 1.5; color: var(--muted); }
```

---

## Border radii

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | `10px` | Chips, tags, small pills |
| `--radius-md` | `16px` | Inputs, cards, buttons |
| `--radius-lg` | `22px` | Grouped lists, large cards |

---

## Do not

- Add horizontal padding to page components — AppShell `.content` provides `16px` on each side.
- Use `border-bottom` dividers on list rows — use the gap+background pattern.
- Use `box-shadow` on filled surfaces.
- Use gradients.
- Add more than 3 fonts.
- Use font-weight below 400 or above 700.
