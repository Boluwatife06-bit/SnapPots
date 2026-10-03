# SnapPots

Gamified micro-savings for young Nigerians. Save in Pots, keep a daily streak, and earn yield — solo, with your squad, or Ajo-style.

## Stack

- TanStack Start
- React 19 + TypeScript
- Tailwind CSS v4
- Supabase (auth + data)
- Vite 8

## Local development

You need Node.js 22+.

```sh
git clone https://github.com/Boluwatife06-bit/SnapPots.git
cd SnapPots
npm install
cp .env.example .env
npm run dev
```

Fill `.env` with your own Supabase project URL and publishable key. Never commit secrets.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

## Backend

Database migrations live in `supabase/migrations`. Apply them to a Supabase project you control, then set the environment variables in `.env.example`. Auth, storage, and payments are not bundled with this source — wire those to services you own.
