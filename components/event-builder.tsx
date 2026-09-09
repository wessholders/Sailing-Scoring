'use client';

import { useMemo, useState } from 'react';
import type { Event, EventRegistrationInvite, Team } from '@/lib/domain';

type EventBuilderProps = {
  event: Event;
  hostTeam: Team;
  registrationInvites: EventRegistrationInvite[];
};

type TeamRegistrationRow = EventRegistrationInvite & {
  added: boolean;
};

export function EventBuilder({ event, hostTeam, registrationInvites }: EventBuilderProps) {
  const [eventCreated, setEventCreated] = useState(true);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [rows, setRows] = useState<TeamRegistrationRow[]>(
    registrationInvites.map((invite) => ({
      ...invite,
      added: invite.status === 'REGISTERED' || invite.status === 'NEEDS_ACCOUNT',
    })),
  );

  const registeredCount = rows.filter((row) => row.status === 'REGISTERED').length;
  const needsAccountCount = rows.filter((row) => row.status === 'NEEDS_ACCOUNT').length;
  const invitedCount = rows.filter((row) => row.status === 'INVITED').length;
  const eventStatusLabel = eventCreated ? 'Created' : 'Draft';

  const registrationSummary = useMemo(
    () => [
      { label: 'Registered', value: registeredCount },
      { label: 'Needs Account', value: needsAccountCount },
      { label: 'Invited', value: invitedCount },
    ],
    [invitedCount, needsAccountCount, registeredCount],
  );

  async function copyInviteLink(invite: TeamRegistrationRow) {
    await navigator.clipboard?.writeText(invite.registrationUrl).catch(() => undefined);
    setCopiedInviteId(invite.id);
  }

  function markAdded(inviteId: string) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === inviteId
          ? {
              ...row,
              added: true,
              status: row.status === 'INVITED' ? 'NEEDS_ACCOUNT' : row.status,
            }
          : row,
      ),
    );
  }

  function markRegistered(inviteId: string) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === inviteId
          ? {
              ...row,
              added: true,
              status: 'REGISTERED',
            }
          : row,
      ),
    );
  }

  return (
    <section className="rounded-lg border border-[#d7ded2] bg-white">
      <div className="border-b border-[#d7ded2] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Create Event</h2>
            <p className="text-sm text-[#66756d]">
              Host admins can create a regatta, add known teams, and generate invite links for teams that still need accounts.
            </p>
          </div>
          <span className="rounded-md bg-[#eef2eb] px-3 py-2 text-sm font-semibold text-[#405850]">
            {eventStatusLabel}
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event name" value={event.name} />
          <Field label="Host" value={hostTeam.name} />
          <Field label="Location" value={event.location} />
          <Field label="Boat class" value={event.boatClass} />
          <Field label="Start date" value={event.startDate} type="date" />
          <Field label="End date" value={event.endDate} type="date" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md bg-[#193f3a] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setEventCreated(true)}
            type="button"
          >
            Create Event
          </button>
          <button
            className="rounded-md border border-[#cbd6cd] bg-white px-4 py-2 text-sm font-semibold text-[#405850]"
            onClick={() => setEventCreated(false)}
            type="button"
          >
            Reset Draft
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {registrationSummary.map((item) => (
            <div className="rounded-md bg-[#f7f8f4] px-4 py-3" key={item.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#66756d]">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead className="bg-[#eef2eb] text-xs uppercase tracking-[0.08em] text-[#66756d]">
              <tr>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((invite) => (
                <tr className="border-t border-[#edf0ea]" key={invite.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{invite.teamName}</p>
                    <p className="text-xs text-[#66756d]">{invite.added ? 'Added to event' : 'Not added yet'}</p>
                  </td>
                  <td className="px-4 py-3 text-[#52645e]">{invite.contactEmail}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-[#fff4df] px-2 py-1 text-xs font-semibold text-[#7a4b12]">
                      {invite.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-md border border-[#cbd6cd] px-3 py-2 font-semibold text-[#405850]"
                        onClick={() => markAdded(invite.id)}
                        type="button"
                      >
                        Add Team
                      </button>
                      <button
                        className="rounded-md border border-[#cbd6cd] px-3 py-2 font-semibold text-[#405850]"
                        onClick={() => copyInviteLink(invite)}
                        type="button"
                      >
                        Registration Link
                      </button>
                      <button
                        className="rounded-md border border-[#cbd6cd] px-3 py-2 font-semibold text-[#405850]"
                        onClick={() => markRegistered(invite.id)}
                        type="button"
                      >
                        Mark Registered
                      </button>
                    </div>
                    {copiedInviteId === invite.id && (
                      <p className="mt-2 break-all text-xs text-[#66756d]">{invite.registrationUrl}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
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
