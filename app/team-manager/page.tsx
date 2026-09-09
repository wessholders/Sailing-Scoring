import Link from 'next/link';
import { canManageTeam, getCurrentUser } from '@/lib/auth/permissions';
import {
  getAssignmentsForEntry,
  getEventBySlug,
  getEventDivisions,
  getEventEntries,
  getRosterForTeam,
  getSailorById,
  getTeamBySlug,
} from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export default async function TeamManagerPage() {
  const user = await getCurrentUser();
  const team = getTeamBySlug('wisconsin');
  const event = getEventBySlug('fall-fury-2026');
  const allowed = team ? await canManageTeam(team.id) : false;

  if (!team || !event) {
    return null;
  }

  const roster = getRosterForTeam(team.id);
  const entry = getEventEntries(event.id).find((candidate) => candidate.teamId === team.id);
  const divisions = getEventDivisions(event.id);
  const assignments = entry ? getAssignmentsForEntry(entry.id) : [];

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <Link className="text-sm font-semibold text-[#55706a]" href="/">
            Back to events
          </Link>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight">Team Manager</h1>
          <p className="mt-2 text-[#52645e]">
            Signed in as {user.name}. Managing {team.name}.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
        {!allowed && (
          <div className="rounded-lg border border-[#e7b8aa] bg-[#fff4ef] p-4 text-sm text-[#8a321f]">
            This route checks team-manager permissions server-side. The demo user is allowed locally.
          </div>
        )}
        <section className="rounded-lg border border-[#d7ded2] bg-white">
          <div className="border-b border-[#d7ded2] px-5 py-4">
            <h2 className="text-xl font-semibold">Roster</h2>
            <p className="text-sm text-[#66756d]">Membership records are historical and season-aware.</p>
          </div>
          <div className="divide-y divide-[#edf0ea]">
            {roster.map((sailor) => (
              <div className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-[1fr_120px_120px]" key={sailor.id}>
                <Link className="font-semibold hover:underline" href={`/sailors/${sailor.slug}`}>
                  {sailor.firstName} {sailor.lastName}
                </Link>
                <span>Class of {sailor.graduationYear}</span>
                <span className="rounded-md bg-[#eef2eb] px-2 py-1 text-center text-xs font-semibold text-[#405850]">
                  Active
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-[#d7ded2] bg-white p-5">
          <h2 className="text-xl font-semibold">Fall Fury Lineups</h2>
          <div className="mt-4 space-y-5">
            {divisions.map((division) => (
              <div key={division.id}>
                <p className="font-semibold">{division.name}</p>
                <div className="mt-2 space-y-2 text-sm text-[#52645e]">
                  {assignments
                    .filter((assignment) => assignment.divisionId === division.id)
                    .map((assignment) => {
                      const sailor = getSailorById(assignment.sailorId);
                      return (
                        <p key={assignment.id}>
                          R{assignment.startRaceNumber}-{assignment.endRaceNumber ?? 'end'} {assignment.role}:{' '}
                          {sailor?.firstName} {sailor?.lastName}
                        </p>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
