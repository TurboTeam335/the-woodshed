# The Woodshed

> Your daily AI-powered guitar practice coach. Progressive overload, structured sessions, built-in metronome.

## Setup

### Prerequisites
- Node.js 20+
- npm 10+
- macOS (arm64 or x64)

### Install

```bash
npm install
```

> `postinstall` automatically rebuilds `better-sqlite3` for Electron's Node.js version.

### Development

```bash
npm run dev
```

### Production build

```bash
npm run dist   # creates a .dmg in dist/
```

---

## First Run

1. Launch the app
2. Go to **Settings** and paste your [Anthropic API key](https://console.anthropic.com)
3. Return to **Dashboard** and hit **Generate Session**
4. Work through the 7 timed blocks — check them off as you go
5. Rate the session when done — the AI reads your feedback to shape the next one

---

## Architecture

| Layer | Tech |
|-------|------|
| Desktop shell | Electron 32 |
| Build tool | electron-vite + Vite 5 |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS 3 (dark theme) |
| State | Zustand |
| Routing | React Router v6 (HashRouter) |
| Database | better-sqlite3 (SQLite) |
| AI | Claude 3.5 Sonnet via @anthropic-ai/sdk |
| Notation | alphaTab (CDN fonts) |
| Metronome | Web Audio API lookahead scheduler |

### Data location
`~/Library/Application Support/the-woodshed/woodshed.db`

### Key source files
```
src/
  shared/types.ts          — all TypeScript interfaces
  main/
    index.ts               — Electron window
    database.ts            — SQLite queries
    claude.ts              — Claude API + prompt
    ipc.ts                 — all IPC handlers
  preload/index.ts         — contextBridge bridge
  renderer/src/
    stores/useStore.ts     — app state (Zustand)
    hooks/useTimer.ts      — rAF countdown timer
    hooks/useMetronome.ts  — Web Audio metronome
    lib/notationUtils.ts   — JSON → AlphaTex converter
    views/                 — Dashboard, Session, Progress, Settings
    components/            — UI components
```

---

## Session structure

Each generated session is exactly 60 minutes across 7 blocks:

| Block | Duration | Focus |
|-------|----------|-------|
| Technique | 10–15 min | Legato, bending, position work |
| Rhythm & Groove | 10–15 min | Metronome, pocket, muting |
| Improvisation | 10–15 min | Scale navigation, motif development |
| Theory Applied | 5–10 min | Chord subs, modal awareness |
| Ear Training | 5–10 min | Interval recognition, transcription |
| Composition | 5–10 min | Motif, arrangement, song-craft |
| Creative Challenge | 5–10 min | Bonus — optional |

The AI reads your last 10 sessions (ratings + notes) and applies progressive overload: every repeating exercise type must be harder than before.

---

## Gamification

- **XP** per completed block (50–150) + completion bonus + rating bonus + streak bonus
- **Streak** tracked daily — session must be rated to count
- **Badges**: First Session, 3/7/30-day streaks, 5/10/30 sessions, 1k/5k XP, Perfect Session

---

## Stylistic influences baked into the AI prompt

- **Steve Lukather** — polished lead, legato lines that sing
- **Paul Jackson Jr.** — pocket rhythm, feel, ghost notes
- **Ray Parker Jr.** — funky and melodic, versatile
- **Nile Rodgers** — rhythmic precision, economy, groove