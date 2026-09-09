import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  formatDateRange,
  getAssignmentsForEntry,
  getDivisionStandings,
  getEventBySlug,
  getEventDivisions,
  getEventEntries,
  getEventRaces,
  getEventStandings,
  getSailorById,
  getSeasonById,
  getTeamById,
  raceProgress,
} from '@/lib/seed-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { events } = await import('@/lib/seed-data');
  return events.map((event) => ({ slug: event.slug }));
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const host = getTeamById(event.hostTeamId ?? '');
  const season = getSeasonById(event.seasonId);
  const entries = getEventEntries(event.id);
  const divisions = getEventDivisions(event.id);
  const races = getEventRaces(event.id);
  const overall = getEventStandings(event.id);

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <Link className="text-sm font-semibold text-[#55706a]" href="/">
            Back to events
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#193f3a] px-2 py-1 text-xs font-bold text-white">
                  {event.status}
                </span>
                <span className="text-sm font-semibold text-[#55706a]">{season?.name}</span>
              </div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                {event.name}
              </h1>
              <p className="mt-3 text-base text-[#52645e]">
                {host?.shortName} - {formatDateRange(event)} - {event.location}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Boat Class" value={event.boatClass} />
              <Stat label="Scoring" value="ICSA Fleet" />
              <Stat label="Entries" value={entries.length.toString()} />
              <Stat label="Progress" value={raceProgress(event.id)} />
            </dl>
          </div>
          <nav className="mt-6 flex gap-2 overflow-x-auto text-sm font-semibold">
            {['Overview', 'Scores', 'Sailors', 'Event Info'].map((item) => (
              <a
                className="rounded-md border border-[#cbd6cd] bg-white px-3 py-2 text-[#405850]"
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                key={item}
              >
                {item}
              </a>
            ))}
            <Link
              className="rounded-md bg-[#193f3a] px-3 py-2 text-white"
              href={`/scorer/events/${event.slug}`}
            >
              Score Event
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-10">
        <div className="space-y-6">
          <section className="rounded-lg border border-[#d7ded2] bg-white" id="overview">
            <div className="border-b border-[#d7ded2] px-5 py-4">
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="text-sm text-[#66756d]">Current overall standings from counted race results.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#eef2eb] text-xs uppercase tracking-[0.08em] text-[#66756d]">
                  <tr>
                    <th className="px-5 py-3">Place</th>
                    <th className="px-5 py-3">Entry</th>
                    <th className="px-5 py-3">Team</th>
                    {divisions.map((division) => (
                      <th className="px-5 py-3" key={division.id}>{division.code} Total</th>
                    ))}
                    <th className="px-5 py-3">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {overall.map((standing) => {
                    const entry = entries.find((candidate) => candidate.id === standing.eventEntryId);
                    const team = getTeamById(entry?.teamId ?? '');

                    return (
                      <tr className="border-t border-[#edf0ea]" key={standing.eventEntryId}>
                        <td className="px-5 py-4 font-semibold">
                          {standing.tied ? `T-${standing.place}` : standing.place}
                        </td>
                        <td className="px-5 py-4">
                          <Link className="font-semibold hover:underline" href={`/teams/${team?.slug}`}>
                            {entry?.entryName}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-[#66756d]">{team?.name}</td>
                        {divisions.map((division) => (
                          <td className="px-5 py-4" key={division.id}>
                            {standing.divisionTotals[division.id] ?? 0}
                          </td>
                        ))}
                        <td className="px-5 py-4 text-base font-semibold">{standing.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-6" id="scores">
            {divisions.map((division) => {
              const divisionRaces = races
                .filter((race) => race.divisionId === division.id && race.status === 'COMPLETED')
                .sort((a, b) => a.raceNumber - b.raceNumber);
              const standings = getDivisionStandings(event.id, division.id);

              return (
                <div className="rounded-lg border border-[#d7ded2] bg-white" key={division.id}>
                  <div className="border-b border-[#d7ded2] px-5 py-4">
                    <h2 className="text-xl font-semibold">{division.name}</h2>
                    <p className="text-sm text-[#66756d]">Race-by-race low-point scoring matrix.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                      <thead className="sticky top-0 bg-[#eef2eb] text-xs uppercase tracking-[0.08em] text-[#66756d]">
                        <tr>
                          <th className="sticky left-0 bg-[#eef2eb] px-5 py-3">Team</th>
                          {divisionRaces.map((race) => (
                            <th className="px-4 py-3 text-center" key={race.id}>
                              R{race.raceNumber}
                            </th>
                          ))}
                          <th className="px-5 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((standing) => {
                          const entry = entries.find((candidate) => candidate.id === standing.eventEntryId);
                          return (
                            <tr className="border-t border-[#edf0ea]" key={standing.eventEntryId}>
                              <td className="sticky left-0 bg-white px-5 py-3 font-semibold">
                                {entry?.entryName}
                              </td>
                              {standing.scores.map((score) => (
                                <td className="px-4 py-3 text-center" key={score.raceId}>
                                  <ScoreCell value={score.displayValue} isStatus={Boolean(score.statusCode)} />
                                </td>
                              ))}
                              <td className="px-5 py-3 text-right font-semibold">{standing.total}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="rounded-lg border border-[#d7ded2] bg-white" id="sailors">
            <div className="border-b border-[#d7ded2] px-5 py-4">
              <h2 className="text-xl font-semibold">Sailors</h2>
              <p className="text-sm text-[#66756d]">Lineups are race ranges, not permanent event labels.</p>
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              {entries.slice(0, 8).map((entry) => {
                const assignments = getAssignmentsForEntry(entry.id);
                return (
                  <div className="rounded-lg border border-[#edf0ea] p-4" key={entry.id}>
                    <h3 className="font-semibold">{entry.entryName}</h3>
                    {divisions.map((division) => {
                      const divisionAssignments = assignments.filter(
                        (assignment) => assignment.divisionId === division.id,
                      );
                      return (
                        <div className="mt-4" key={division.id}>
                          <p className="text-sm font-semibold text-[#405850]">{division.name}</p>
                          <div className="mt-2 space-y-1 text-sm text-[#52645e]">
                            {divisionAssignments.map((assignment) => {
                              const sailor = getSailorById(assignment.sailorId);
                              return (
                                <p key={assignment.id}>
                                  Races {assignment.startRaceNumber}-{assignment.endRaceNumber ?? 'end'}:{' '}
                                  <span className="font-semibold">{assignment.role.toLowerCase()}</span>{' '}
                                  <Link className="text-[#193f3a] underline" href={`/sailors/${sailor?.slug}`}>
                                    {sailor?.firstName} {sailor?.lastName} &apos;{String(sailor?.graduationYear).slice(2)}
                                  </Link>
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6" id="event-info">
          <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
            <h2 className="text-lg font-semibold">Event Info</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Info label="Host" value={host?.name ?? 'TBD'} />
              <Info label="Location" value={event.location} />
              <Info label="Dates" value={formatDateRange(event)} />
              <Info label="Boat" value={event.boatClass} />
              <Info label="Scoring Profile" value="ICSA Collegiate Fleet Racing" />
            </dl>
          </section>
          <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
            <h2 className="text-lg font-semibold">Latest Completed Races</h2>
            <div className="mt-4 space-y-2">
              {races
                .filter((race) => race.status === 'COMPLETED')
                .slice(-6)
                .map((race) => {
                  const division = divisions.find((item) => item.id === race.divisionId);
                  return (
                    <div className="flex items-center justify-between rounded-md bg-[#f7f8f4] px-3 py-2 text-sm" key={race.id}>
                      <span>{division?.code} Division R{race.raceNumber}</span>
                      <span className="font-semibold text-[#405850]">Scored</span>
                    </div>
                  );
                })}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d7ded2] bg-white p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#66756d]">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#66756d]">{label}</dt>
      <dd className="mt-1 text-[#17201b]">{value}</dd>
    </div>
  );
}

function ScoreCell({ value, isStatus }: { value: string; isStatus: boolean }) {
  if (!isStatus) {
    return <span>{value}</span>;
  }

  return (
    <span className="rounded-md bg-[#ffe8df] px-2 py-1 text-xs font-bold text-[#9a341f]">
      {value}
    </span>
  );
}
