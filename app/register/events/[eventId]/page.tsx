import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  events,
  getEventById,
  getEventRegistrationInvites,
  getTeamById,
} from '@/lib/seed-data';

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export async function generateStaticParams() {
  return events.map((event) => ({ eventId: event.id }));
}

export default async function EventRegistrationPage({ params }: PageProps) {
  const { eventId } = await params;
  const event = getEventById(eventId);

  if (!event) {
    notFound();
  }

  const host = getTeamById(event.hostTeamId ?? '');
  const invites = getEventRegistrationInvites(event.id);

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#17201b]">
      <header className="border-b border-[#d7ded2] bg-[#fdfdf9]">
        <div className="mx-auto max-w-4xl px-5 py-5 sm:px-8 lg:px-10">
          <Link className="text-sm font-semibold text-[#55706a]" href={`/events/${event.slug}`}>
            Public event page
          </Link>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight">Register for {event.name}</h1>
          <p className="mt-2 text-[#52645e]">
            Hosted by {host?.name}. Create a manager account, claim your team, and confirm the entry.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-4xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-10">
        <section className="rounded-lg border border-[#d7ded2] bg-white">
          <div className="border-b border-[#d7ded2] px-5 py-4">
            <h2 className="text-xl font-semibold">Account Setup</h2>
            <p className="text-sm text-[#66756d]">The invite token ties this new account to its event registration.</p>
          </div>
          <form className="grid gap-4 p-5">
            <Field label="Name" value="Sam Visiting Manager" />
            <Field label="Email" value="sailing@utexas.edu" type="email" />
            <Field label="Team" value="University of Texas" />
            <Field label="Password" value="demo-password" type="password" />
            <button className="w-fit rounded-md bg-[#193f3a] px-4 py-2 text-sm font-semibold text-white" type="button">
              Create Account and Register
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
            <h2 className="text-lg font-semibold">Invite Queue</h2>
            <div className="mt-4 space-y-2">
              {invites.map((invite) => (
                <div className="rounded-md bg-[#f7f8f4] px-3 py-2 text-sm" key={invite.id}>
                  <p className="font-semibold">{invite.teamName}</p>
                  <p className="text-[#66756d]">{invite.status.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
            <h2 className="text-lg font-semibold">After Registering</h2>
            <div className="mt-4 space-y-2 text-sm text-[#52645e]">
              <p>Team entry is added to the regatta.</p>
              <p>Team manager can update lineups.</p>
              <p>Host scorer can score races immediately.</p>
            </div>
          </section>
        </aside>
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
