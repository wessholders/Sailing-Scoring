# Sailing Scoring

A modern collegiate sailing fleet-racing scoring platform inspired by the function of ICSA Techscore, but designed as a cleaner, faster, more intuitive replacement.

## V1 Scope

This version focuses on fleet racing only. Team racing, match racing, handicap racing, protest workflows, and custom scoring-rule builders are intentionally out of scope.

The current implementation includes:

- Public regatta discovery with live, recent, and upcoming events
- Event pages with overview, overall standings, division score matrices, and sailor lineups
- Sailor profiles with derived participation history
- Team profiles with historical roster membership and recent results
- Scorer dashboard optimized for quick race entry and corrections
- Team-manager dashboard for roster and lineup review
- Admin dashboard for event creation, entries, scorer concepts, and audit history
- Deterministic ICSA fleet scoring engine with tests
- D1-ready relational schema definition
- GitHub Pages static preview workflow
- Realistic fictional seed data

## Architecture

```text
app/
  page.tsx                      Public landing and regatta discovery
  events/[slug]/page.tsx        Public event overview, scores, sailors, info
  sailors/[slug]/page.tsx       Persistent sailor profile
  teams/[slug]/page.tsx         Persistent team profile
  scorer/events/[slug]/page.tsx Fast scorer workflow
  team-manager/page.tsx         Team manager workflow
  admin/page.tsx                Platform admin workflow
components/
  scorer-race-entry.tsx         Client-side fast entry and validation UI
db/
  schema.ts                     D1/SQLite schema statements and indexes
docs/
  backend-plan.md               Account, invitation, organization, and fleet plan
lib/
  auth/permissions.ts           Platform-header auth and server-side permissions
  domain.ts                     Core domain types
  scoring/index.ts              ScoringProfile and IcsaFleetScoringEngine
  seed-data.ts                  Realistic development data
  validation/scoring.ts         Race result validation
  workflows/team-invitations.ts Team invitation workflow logic
tests/
  scoring.test.ts               Core scoring engine tests
```

## Scoring Model

The default scoring profile is `ICSA_FLEET`.

V1 behavior:

- Low-point scoring
- No throwouts
- Multiple divisions
- Overall totals derived from division totals
- Results support both finish information and calculated scoring information
- Status support: `DNC`, `DNS`, `OCS`, `DNF`, `DSQ`, `BKD`, `BYE`
- Ties are resolved by a separate deterministic series tie-break function

## Development

```bash
npm install
npm run dev
```

Local preview:

```text
http://localhost:3000/
```

## Verification

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## GitHub Pages Preview

This repo includes a GitHub Actions workflow at `.github/workflows/pages.yml`.

After pushing to `main`, enable GitHub Pages for the repository with source set to GitHub Actions. The static preview will build with:

```bash
npm run build:pages
```

Expected project-page URL:

```text
https://wessholders.github.io/Sailing-Scoring/
```

## Environment

Use `.env.example` as the documented template. Local `.env` files are ignored by Git.

The project is configured with a logical D1 binding named `DB` in `.openai/hosting.json`; hosted runtime values should be managed through the eventual production host. GitHub Pages is a static preview and does not run the backend.
