import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getConferenceById,
  getSailorBySlug,
  getSailorHistory,
  getTeamById,
  teamMemberships,
} from '@/lib/seed-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { sailors } = await import('@/lib/seed-data');
  return sailors.map((sailor) => ({ slug: sailor.slug }));
}

export default async function SailorPage({ params }: PageProps) {
  const { slug } = await params;
  const sailor = getSailorBySlug(slug);

  if (!sailor) {
    notFound();
  }

  const activeMembership = teamMemberships.find(
    (membership) => membership.sailorId === sailor.id && membership.active,
  );
  const currentTeam = getTeamById(activeMembership?.teamId ?? '');
  const conference = getConferenceById(currentTeam?.conferenceId);
  const history = getSailorHistory(sailor.id);
  const raceStarts = history.reduce((sum, row) => {
    const endRace = row.assignment.endRaceNumber ?? 6;
    return sum + (endRace - row.assignment.startRaceNumber + 1);
  }, 0);

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <Header />
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#55706a]">
          Sailor Profile
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">
          {sailor.firstName} {sailor.lastName}
        </h1>
        <p className="mt-3 text-[#52645e]">
          {currentTeam?.name} - Class of {sailor.graduationYear} - {conference?.shortName}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Stat label="Regattas Sailed" value={new Set(history.map((row) => row.event.id)).size.toString()} />
          <Stat label="Race Starts" value={raceStarts.toString()} />
          <Stat label="Current Team" value={currentTeam?.shortName ?? 'Unattached'} />
        </div>

        <section className="mt-8 rounded-lg border border-[#d7ded2] bg-white">
          <div className="border-b border-[#d7ded2] px-5 py-4">
            <h2 className="text-xl font-semibold">Results</h2>
            <p className="text-sm text-[#66756d]">Derived from lineup assignments and event records.</p>
          </div>
          <div className="divide-y divide-[#edf0ea]">
            {history.map(({ assignment, division, entry, event }) => (
              <div className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[1fr_180px_180px]" key={assignment.id}>
                <Link className="font-semibold hover:underline" href={`/events/${event.slug}`}>
                  {event.name}
                </Link>
                <span>{entry.entryName} - {division.name}</span>
                <span className="text-[#66756d]">
                  {assignment.role} R{assignment.startRaceNumber}-{assignment.endRaceNumber ?? 'end'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8 lg:px-10">
        <Link className="text-sm font-semibold text-[#55706a]" href="/">
          Back to events
        </Link>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d7ded2] bg-white p-5">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#66756d]">{label}</p>
    </div>
  );
}
