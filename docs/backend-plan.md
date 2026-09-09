# Backend Plan

## Product Shape

Sailing Scoring should support both universities and yacht clubs. The backend should treat each school, yacht club, association, or similar customer as an `Organization`.

An organization can own:

- team or club profile data
- managers and admins
- sailors or members
- boat/fleet assets
- hosted events
- event entries

This keeps the door open for future URLs such as:

```text
/o/wisconsin
/o/lakewood-yacht-club
```

or custom domains later, where the home page can change based on the organization context.

## Account Model

`User` is the authenticated account.

`Sailor` is the sporting identity.

They are linked through `SailorAccountLink`, not merged into one table. This lets historical sailors exist without login accounts and lets a sailor claim an account later.

## Team And Club Roles

Use scoped roles rather than global flags:

- `OrganizationUserRole` for organization-level admins
- `UserTeamRole` for team admins and team managers
- `EventUserRole` for event scorers and event admins

Team managers can manage roster and lineups. Team admins can also invite other managers/admins. Scorers are scoped to events and should not automatically gain team roster permissions.

## Invitation Flow

The intended flow:

1. A team admin opens the team manager dashboard.
2. They enter the sailor or manager email address.
3. The backend creates a `TeamInvitation`.
4. The raw invite token is sent by email and only a hash is stored.
5. The recipient opens the link.
6. They create or sign into a `User` account.
7. The backend accepts the invite transactionally.
8. For a sailor invite, it creates or links a `Sailor`, creates `TeamMembership`, and creates `SailorAccountLink`.
9. For a manager/admin invite, it creates `UserTeamRole`.
10. The invitation is marked accepted and cannot be reused.

The pure workflow functions live in `lib/workflows/team-invitations.ts`; database-backed route handlers should call those functions inside transactions.

## Fleet Assets

Universities and yacht clubs can eventually manage boats in `TeamBoat`.

Initial fields:

- team
- boat class
- hull number
- hull name
- sail number
- active flag

Later, event lineups can optionally reference boats without changing the scoring model.

## Static Preview Versus Production Backend

GitHub Pages is useful for previewing the product shape, but it cannot host the real server-side backend.

The static preview should stay seed-data driven. Production should move writes to a hosted backend with:

- relational database
- server-side auth
- invitation email delivery
- transactional score writes
- audit logging
- derived standings from canonical race results

The current D1-ready schema is in `db/schema.ts`.
