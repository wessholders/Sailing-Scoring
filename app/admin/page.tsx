import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/permissions';
import {
  auditLog,
  events,
  getEventEntries,
  getSeasonById,
  getTeamById,
  scoringProfiles,
  seasons,
  teams,
} from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();
  const liveEvent = events.find((event) => event.status === 'LIVE');

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <Link className="text-sm font-semibold text-[#55706a]" href="/">
            Back to events
          </Link>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight">Platform Admin</h1>
          <p className="mt-2 text-[#52645e]">
            Signed in as {user.name}. Create events, manage entries, assign scorers, and inspect audit history.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10">
        <section className="rounded-lg border border-[#d7ded2] bg-white">
          <div className="border-b border-[#d7ded2] px-5 py-4">
            <h2 className="text-xl font-semibold">Create Event</h2>
            <p className="text-sm text-[#66756d]">Defaults to ICSA Collegiate Fleet Racing.</p>
          </div>
          <form className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Event name" value="Fall Fury 2026" />
            <Field label="Season" value={seasons[0].name} />
            <Field label="Host" value={teams[0].name} />
            <Field label="Location" value="Lake Mendota, Madison, WI" />
            <Field label="Start date" value="2026-09-12" type="date" />
            <Field label="End date" value="2026-09-13" type="date" />
            <Field label="Boat class" value="420" />
            <Field label="Divisions" value="2" type="number" />
            <label className="block text-sm font-medium sm:col-span-2">
              Scoring profile
              <select className="mt-2 w-full rounded-md border border-[#cbd6cd] bg-white px-3 py-2 outline-none focus:border-[#193f3a]" defaultValue={scoringProfiles[0].id}>
                {scoringProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="w-fit rounded-md bg-[#193f3a] px-4 py-2 font-semibold text-white" type="button">
              Create Event
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
            <h2 className="text-xl font-semibold">Event Entries</h2>
            <p className="mt-1 text-sm text-[#66756d]">Multiple entries can point to one team.</p>
            <div className="mt-4 space-y-2">
              {liveEvent &&
                getEventEntries(liveEvent.id).slice(0, 6).map((entry) => {
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

function Field({ label, value, type = 'text' }: { label: string; value: string; type?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        className="mt-2 w-full rounded-md border border-[#cbd6cd] px-3 py-2 outline-none focus:border-[#193f3a]"
        defaultValue={value}
        type={type}
      />
    </label>
  );
}
