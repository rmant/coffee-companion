# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

Coffee Companion is a Next.js 16 app (App Router) with Supabase backend for tracking pour-over coffee brewing.

### Data Model

Four tables: `coffees`, `brewers`, `brews`, `user_settings`. Schema in `supabase/schema.sql`. TypeScript types in `lib/types/database.ts`.

- **Coffee**: name, roaster, origin, process, roast level/date, flavor notes, status (active/finished/wishlist)
- **Brewer**: name, type (v60/chemex/origami/aeropress/kalita/other), filter type, defaults
- **Brew**: links coffee+brewer with settings (dose, water, grind, temp, bloom, time) and results (rating, tasting notes, feedback, goal)

### Supabase Clients

- `lib/supabase/server.ts` - Server Components/Route Handlers (uses cookies)
- `lib/supabase/client.ts` - Client Components (browser client)

Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### API Routes

All in `app/api/`:
- `coffees/` and `coffees/[id]/` - CRUD for coffees
- `brewers/` - List/create brewers
- `brews/`, `brews/[id]/`, `brews/best/`, `brews/last-settings/` - Brew operations
- `export/ai/` - Generate AI prompt context for brew analysis

### Key Utilities

`lib/utils/brew-calculations.ts`:
- `calculateRatio(dose, water)` - Returns "1:X.X" format
- `calculateDaysOffRoast(roastDate)` - Days since roasting
- `withRatio(brew)` / `withDaysOffRoast(coffee)` - Add computed fields
- `formatBrewTime(seconds)` / `parseBrewTime(string)` - Time formatting
- `generateAIPromptContext(data)` - Build markdown for AI export

### UI Components

Uses shadcn/ui (new-york style) with Radix primitives. Components in `components/ui/`. Domain-specific forms in `components/coffee/`, `components/brewer/`, `components/brew/`.


<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>