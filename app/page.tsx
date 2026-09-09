import Link from 'next/link';
import {
  events,
  formatDateRange,
  getEventEntries,
  getEventStandings,
  getSeasonById,
  getTeamById,
  raceProgress,
  seasons,
  sailors,
  teams,
} from '../lib/seed-data';

export default function Home() {
  const liveEvents = events.filter((event) => event.status === 'LIVE');
  const recentEvents = events.filter((event) => event.status === 'COMPLETED');
  const upcomingEvents = events.filter((event) => event.status === 'UPCOMING');
  const searchableRecords = [
    ...events.map((event) => ({ label: event.name, href: `/events/${event.slug}`, type: 'Event' })),
    ...teams.map((team) => ({ label: team.name, href: `/teams/${team.slug}`, type: 'Team' })),
    ...sailors.slice(0, 8).map((sailor) => ({
      label: `${sailor.firstName} ${sailor.lastName}`,
      href: `/sailors/${sailor.slug}`,
      type: 'Sailor',
    })),
  ];

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <Link className="text-xl font-semibold tracking-tight" href="/">
            Sailing Scoring
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#405850]">
            <Link className="rounded-md px-3 py-2 hover:bg-[#eef2eb]" href="/admin">
              Admin
            </Link>
            <Link className="rounded-md px-3 py-2 hover:bg-[#eef2eb]" href="/team-manager">
              Team Manager
            </Link>
            <Link
              className="rounded-md bg-[#193f3a] px-3 py-2 text-white"
              href="/scorer/events/aggie-open-2026"
            >
              Score Live Event
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#55706a]">
              Collegiate fleet racing
            </p>
            <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Live regatta scoring that feels built for race day.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#52645e]">
              Public results, persistent sailors and teams, division scoring, lineups,
              corrections, and audit-ready workflows in one modern scoring surface.
            </p>
          </div>

          <div className="rounded-lg border border-[#d7ded2] bg-white p-4">
            <label className="text-sm font-semibold" htmlFor="global-search">
              Search events, teams, sailors
            </label>
            <input
              className="mt-2 w-full rounded-md border border-[#cbd6cd] px-3 py-2 outline-none focus:border-[#193f3a]"
              id="global-search"
              placeholder="Try Aggie Open, Texas A&M, Avery Collins"
            />
            <div className="mt-4 grid gap-2">
              {searchableRecords.slice(0, 6).map((record) => (
                <Link
                  className="flex items-center justify-between rounded-md border border-[#edf0ea] px-3 py-2 text-sm hover:bg-[#f7f8f4]"
                  href={record.href}
                  key={`${record.type}-${record.href}`}
                >
                  <span>{record.label}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#66756d]">
                    {record.type}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Live Events</h2>
            <p className="text-sm text-[#66756d]">Current racing activity gets top billing.</p>
          </div>
          <div className="flex gap-2">
            {seasons.map((season) => (
              <button
                className="rounded-md border border-[#cbd6cd] bg-white px-3 py-2 text-sm font-semibold text-[#405850]"
                key={season.id}
                type="button"
              >
                {season.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {liveEvents.map((event) => {
            const host = getTeamById(event.hostTeamId ?? '');
            const standings = getEventStandings(event.id).slice(0, 3);
            const entries = getEventEntries(event.id);

            return (
              <Link
                className="rounded-lg border border-[#d7ded2] bg-white p-5 shadow-sm transition hover:border-[#193f3a]"
                href={`/events/${event.slug}`}
                key={event.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-[#c34b35] px-2 py-1 text-xs font-bold text-white">
                      LIVE
                    </span>
                    <h3 className="mt-3 text-2xl font-semibold">{event.name}</h3>
                    <p className="mt-1 text-sm text-[#66756d]">
                      Hosted by {host?.shortName} - {formatDateRange(event)}
                    </p>
                  </div>
                  <div className="text-left text-sm text-[#66756d] sm:text-right">
                    <p>{event.location}</p>
                    <p>{event.numberOfDivisions} divisions - {raceProgress(event.id)}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-2">
                  {standings.map((standing) => {
                    const entry = entries.find((candidate) => candidate.id === standing.eventEntryId);
                    return (
                      <div
                        className="grid grid-cols-[44px_1fr_72px] items-center rounded-md bg-[#f7f8f4] px-3 py-2 text-sm"
                        key={standing.eventEntryId}
                      >
                        <span className="font-semibold">{standing.tied ? `T-${standing.place}` : standing.place}</span>
                        <span>{entry?.entryName}</span>
                        <span className="text-right font-semibold">{standing.total}</span>
                      </div>
                    );
                  })}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-10 sm:px-8 lg:grid-cols-2 lg:px-10">
        <EventList title="Recent Events" eventsToShow={recentEvents} />
        <EventList title="Upcoming Events" eventsToShow={upcomingEvents} />
      </section>
    </main>
  );
}

function EventList({ title, eventsToShow }: { title: string; eventsToShow: typeof events }) {
  return (
    <section className="rounded-lg border border-[#d7ded2] bg-white">
      <div className="border-b border-[#d7ded2] px-5 py-4">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="divide-y divide-[#edf0ea]">
        {eventsToShow.map((event) => {
          const host = getTeamById(event.hostTeamId ?? '');
          const season = getSeasonById(event.seasonId);
          const winner =
            event.status === 'COMPLETED'
              ? getEventEntries(event.id).find(
                  (entry) => entry.id === getEventStandings(event.id)[0]?.eventEntryId,
                )?.entryName ?? 'Scores final'
              : 'Registration open';

          return (
            <Link
              className="grid gap-1 px-5 py-4 text-sm hover:bg-[#f7f8f4]"
              href={`/events/${event.slug}`}
              key={event.id}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{event.name}</span>
                <span className="rounded-md bg-[#eef2eb] px-2 py-1 text-xs font-semibold text-[#405850]">
                  {event.status}
                </span>
              </div>
              <p className="text-[#66756d]">
                {formatDateRange(event)} - {host?.shortName} - {season?.name}
              </p>
              <p className="text-[#405850]">{winner}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
