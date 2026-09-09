import Link from 'next/link';
import { EventBuilder } from '@/components/event-builder';
import { getCurrentUser } from '@/lib/auth/permissions';
import {
  auditLog,
  events,
  getEventBySlug,
  getEventEntries,
  getEventRegistrationInvites,
  getSeasonById,
  getTeamById,
} from '@/lib/seed-data';

export default async function AdminPage() {
  const user = await getCurrentUser();
  const hostEvent = getEventBySlug('aggie-open-2026');
  const hostTeam = hostEvent ? getTeamById(hostEvent.hostTeamId ?? '') : undefined;
  const liveEvent = hostEvent ?? events.find((event) => event.status === 'LIVE');

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <Link className="text-sm font-semibold text-[#55706a]" href="/">
            Back to events
          </Link>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight">Host Admin</h1>
          <p className="mt-2 text-[#52645e]">
            Signed in as {user.name}. Create events, manage entries, generate registration links, and score home regattas.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10">
        {hostEvent && hostTeam && (
          <EventBuilder
            event={hostEvent}
            hostTeam={hostTeam}
            registrationInvites={getEventRegistrationInvites(hostEvent.id)}
          />
        )}

        <aside className="space-y-6">
          <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Event Entries</h2>
                <p className="mt-1 text-sm text-[#66756d]">Attending teams become scoring entries after registration.</p>
              </div>
              {hostEvent && (
                <Link
                  className="rounded-md bg-[#193f3a] px-3 py-2 text-sm font-semibold text-white"
                  href={`/scorer/events/${hostEvent.slug}`}
                >
                  Score
                </Link>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {liveEvent &&
                getEventEntries(liveEvent.id).map((entry) => {
                  const team = getTeamById(entry.teamId);
                  return (
                    <div className="rounded-md bg-[#f7f8f4] px-3 py-2 text-sm" key={entry.id}>
                      <p className="font-semibold">{entry.entryName}</p>
                      <p className="text-[#66756d]">{team?.name}</p>
                    </div>
                  );
                })}
            </div>
          </section>
          <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
            <h2 className="text-xl font-semibold">Audit Log</h2>
            <div className="mt-4 space-y-3">
              {auditLog.map((item) => (
                <div className="rounded-md border border-[#edf0ea] p-3 text-sm" key={item.id}>
                  <p className="font-semibold">{item.action}</p>
                  <p className="text-[#66756d]">{item.actor} - {new Date(item.timestamp).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-[#66756d]">{item.oldValue} to {item.newValue}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <div className="rounded-lg border border-[#d7ded2] bg-white">
          <div className="border-b border-[#d7ded2] px-5 py-4">
            <h2 className="text-xl font-semibold">Events</h2>
          </div>
          <div className="divide-y divide-[#edf0ea]">
            {events.map((event) => {
              const host = getTeamById(event.hostTeamId ?? '');
              const season = getSeasonById(event.seasonId);
              return (
                <Link className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[1fr_140px_180px_120px]" href={`/events/${event.slug}`} key={event.id}>
                  <span className="font-semibold">{event.name}</span>
                  <span>{season?.name}</span>
                  <span>{host?.shortName}</span>
                  <span>{event.status}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
