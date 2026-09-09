import Link from 'next/link';
import { TeamLineupEditor } from '@/components/team-lineup-editor';
import { canManageTeam, getCurrentUser } from '@/lib/auth/permissions';
import {
  getAssignmentsForEntry,
  getEventBySlug,
  getEventDivisions,
  getEventEntries,
  getRosterForTeam,
  getSailorById,
  getTeamBoats,
  getTeamInvitations,
  getTeamById,
  getTeamBySlug,
} from '@/lib/seed-data';

export default async function TeamManagerPage() {
  const user = await getCurrentUser();
  const team = getTeamBySlug('texas-am');
  const event = getEventBySlug('aggie-open-2026');
  const allowed = team ? await canManageTeam(team.id) : false;

  if (!team || !event) {
    return null;
  }

  const roster = getRosterForTeam(team.id);
  const invitations = getTeamInvitations(team.id);
  const boats = getTeamBoats(team.id);
  const entry = getEventEntries(event.id).find((candidate) => candidate.teamId === team.id);
  const entries = getEventEntries(event.id);
  const divisions = getEventDivisions(event.id);
  const assignments = entry ? getAssignmentsForEntry(entry.id) : [];
  const lineupTeams = entries.map((eventEntry) => {
    const entryTeam = getTeamById(eventEntry.teamId);
    return {
      entryId: eventEntry.id,
      entryName: eventEntry.entryName,
      teamName: entryTeam?.name ?? eventEntry.entryName,
      sailors: getRosterForTeam(eventEntry.teamId).map((sailor) => ({
        id: sailor.id,
        name: `${sailor.firstName} ${sailor.lastName}`,
        graduationYear: sailor.graduationYear,
      })),
      assignments: getAssignmentsForEntry(eventEntry.id).map((assignment) => ({
        divisionId: assignment.divisionId,
        role: assignment.role,
        sailorId: assignment.sailorId,
        startRaceNumber: assignment.startRaceNumber,
        endRaceNumber: assignment.endRaceNumber,
      })),
    };
  });

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <Link className="text-sm font-semibold text-[#55706a]" href="/">
            Back to events
          </Link>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight">Texas A&amp;M Team Manager</h1>
          <p className="mt-2 text-[#52645e]">
            Signed in as {user.name}. Managing roster, invite links, fleet assets, and event lineups for {team.name}.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
        {!allowed && (
          <div className="rounded-lg border border-[#e7b8aa] bg-[#fff4ef] p-4 text-sm text-[#8a321f]">
            This route checks team-manager permissions server-side. The demo user is allowed locally.
          </div>
        )}
        <div className="space-y-6">
          <section className="rounded-lg border border-[#d7ded2] bg-white">
            <div className="border-b border-[#d7ded2] px-5 py-4">
              <h2 className="text-xl font-semibold">Roster</h2>
              <p className="text-sm text-[#66756d]">{roster.length} active sailors are available for lineups and substitutions.</p>
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

          <TeamLineupEditor
            divisions={divisions.map((division) => ({
              id: division.id,
              name: division.name,
              code: division.code,
            }))}
            teams={lineupTeams}
          />

          <section className="rounded-lg border border-[#d7ded2] bg-white">
            <div className="border-b border-[#d7ded2] px-5 py-4">
              <h2 className="text-xl font-semibold">Invite Queue</h2>
              <p className="text-sm text-[#66756d]">
                Team admins invite sailors or managers by email; invite links bind account setup to the team.
              </p>
            </div>
            <div className="divide-y divide-[#edf0ea]">
              {invitations.map((invite) => (
                <div className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_130px_110px]" key={invite.id}>
                  <span className="font-semibold">{invite.email}</span>
                  <span>{invite.intendedRole}</span>
                  <span className="rounded-md bg-[#fff4df] px-2 py-1 text-center text-xs font-semibold text-[#7a4b12]">
                    {invite.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
            <h2 className="text-xl font-semibold">Host Lineup</h2>
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
          </section>

          <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
            <h2 className="text-xl font-semibold">Fleet Assets</h2>
            <p className="mt-1 text-sm text-[#66756d]">Future event assignments can draw from hulls, names, and sail numbers.</p>
            <div className="mt-4 space-y-2">
              {boats.map((boat) => (
                <div className="rounded-md bg-[#f7f8f4] px-3 py-2 text-sm" key={boat.id}>
                  <p className="font-semibold">{boat.hullName} - {boat.sailNumber}</p>
                  <p className="text-[#66756d]">{boat.boatClass} / {boat.hullNumber}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
