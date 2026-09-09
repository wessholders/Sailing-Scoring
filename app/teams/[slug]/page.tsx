import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getConferenceById,
  getRosterForTeam,
  getTeamBySlug,
  getTeamResults,
  seasons,
} from '@/lib/seed-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { teams } = await import('@/lib/seed-data');
  return teams.map((team) => ({ slug: team.slug }));
}

export default async function TeamPage({ params }: PageProps) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  const conference = getConferenceById(team.conferenceId);
  const roster = getRosterForTeam(team.id);
  const results = getTeamResults(team.id);

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8 lg:px-10">
          <Link className="text-sm font-semibold text-[#55706a]" href="/">
            Back to events
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.12em] text-[#55706a]">
            Team Profile
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">{team.name}</h1>
          <p className="mt-3 text-[#52645e]">
            {conference?.name} - Current season {seasons[0].name}
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-10">
        <aside className="rounded-lg border border-[#d7ded2] bg-white p-5">
          <h2 className="text-xl font-semibold">Current Roster</h2>
          <div className="mt-4 divide-y divide-[#edf0ea]">
            {roster.map((sailor) => (
              <Link
                className="flex items-center justify-between py-3 text-sm hover:text-[#193f3a]"
                href={`/sailors/${sailor.slug}`}
                key={sailor.id}
              >
                <span>{sailor.firstName} {sailor.lastName}</span>
                <span className="text-[#66756d]">&apos;{String(sailor.graduationYear).slice(2)}</span>
              </Link>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-[#d7ded2] bg-white">
          <div className="border-b border-[#d7ded2] px-5 py-4">
            <h2 className="text-xl font-semibold">Recent Results</h2>
            <p className="text-sm text-[#66756d]">Event entries stay separate from the underlying school.</p>
          </div>
          <div className="divide-y divide-[#edf0ea]">
            {results.map(({ entry, event, standing }) => (
              <Link
                className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[1fr_160px_100px]"
                href={`/events/${event.slug}`}
                key={`${event.id}-${entry.id}`}
              >
                <span className="font-semibold">{event.name}</span>
                <span>{entry.entryName}</span>
                <span className="font-semibold">
                  {standing.tied ? `T-${standing.place}` : standing.place} / {standing.total}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
