import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ScorerRaceEntry } from '@/components/scorer-race-entry';
import { canManageEvent, getCurrentUser } from '@/lib/auth/permissions';
import {
  getEventBySlug,
  getEventDivisions,
  getEventEntries,
  getEventRaces,
  getEventResults,
} from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ScorerEventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const user = await getCurrentUser();
  const allowed = await canManageEvent(event.id);
  const entries = getEventEntries(event.id);
  const divisions = getEventDivisions(event.id);
  const races = getEventRaces(event.id);
  const results = getEventResults(event.id);
  const activeDivision = divisions[0];
  const selectedRace =
    races.find((race) => race.divisionId === activeDivision.id && race.status === 'IN_PROGRESS') ??
    races.filter((race) => race.divisionId === activeDivision.id).at(-1);

  if (!selectedRace) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link className="text-sm font-semibold text-[#55706a]" href={`/events/${event.slug}`}>
              Public event page
            </Link>
            <span className="rounded-md bg-[#eef2eb] px-3 py-2 text-sm font-semibold text-[#405850]">
              {user.name}
            </span>
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight">Scorer Dashboard</h1>
          <p className="mt-2 text-[#52645e]">
            {event.name}. Fast entry, correction-friendly scoring, server-side permission checked.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {!allowed && (
          <div className="mb-5 rounded-lg border border-[#e7b8aa] bg-[#fff4ef] p-4 text-sm text-[#8a321f]">
            You do not have scorer access for this event.
          </div>
        )}
        <div className="mb-5 flex flex-wrap gap-2">
          {divisions.map((division) => (
            <button
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                division.id === activeDivision.id
                  ? 'border-[#193f3a] bg-[#193f3a] text-white'
                  : 'border-[#cbd6cd] bg-white text-[#405850]'
              }`}
              key={division.id}
              type="button"
            >
              {division.name}
            </button>
          ))}
          <button className="rounded-md border border-[#cbd6cd] bg-white px-3 py-2 text-sm font-semibold text-[#405850]" type="button">
            Create Next Race
          </button>
        </div>
        <ScorerRaceEntry
          division={activeDivision}
          entries={entries}
          existingResults={results}
          races={races}
          selectedRace={selectedRace}
        />
      </section>
    </main>
  );
}
