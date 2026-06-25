# PromptedAndShipped UI design spec

## Product feel

Dark, terminal-coded, developer-native. The reference image is translated into a dark leaderboard dashboard: left icon rail, podium block, ranked rows, and a right-side achievement/score panel.

## Tokens

```css
--background: 216 28% 7%;
--card: 218 25% 10%;
--muted: 218 18% 15%;
--border: 217 20% 19%;
--foreground: 210 40% 96%;
--muted-foreground: 215 16% 67%;
--primary: 151 100% 55%;
--accent-cyan: 188 100% 55%;
--gold: 43 86% 62%;
--silver: 220 12% 72%;
--bronze: 28 65% 55%;
```

## Typography

- Geist Sans for headings and body.
- Geist Mono for ranks, scores, scan logs, ratios, and terminal labels.
- Wordmark: `prompted` light + `AndShipped` bold + cursor.

## Implemented screens

- `/`: landing hero, GitHub CTA, product stats, and reference-inspired dashboard preview.
- `/leaderboard`: full leaderboard rows with top-three treatment, AI ratio badge, trend, and score.
- `/u/[username]`: profile header, large score card, share CTA, and signal breakdown.
- `/scan`: scan-progress UI demo ready to be wired to backend SSE.

## Reusable UI patterns

- Dashboard shell: `rounded-[2rem] border border-border bg-card/75 shadow-card backdrop-blur`.
- Score display: `font-mono text-8xl font-black text-primary`.
- Terminal panel: `rounded-2xl border border-border bg-background/80 p-4 font-mono text-sm`.
- Primary CTA: `bg-primary text-primary-foreground shadow-glow hover:bg-primary/90`.
