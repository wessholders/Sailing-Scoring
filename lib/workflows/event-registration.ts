import type { EventEntry, EventRegistrationInvite, EventRegistrationStatus, Team } from '../domain.ts';

type CreateEventRegistrationInviteInput = {
  id: string;
  eventId: string;
  teamId?: string;
  teamName: string;
  contactEmail: string;
  status?: EventRegistrationStatus;
  token: string;
  tokenHash: string;
  baseUrl: string;
  createdByUserId: string;
  now: string;
};

type AcceptEventRegistrationInviteInput = {
  invite: EventRegistrationInvite;
  team: Team;
  seed: number;
  now: string;
};

export function createEventRegistrationInvite({
  id,
  eventId,
  teamId,
  teamName,
  contactEmail,
  status = 'INVITED',
  token,
  tokenHash,
  baseUrl,
  createdByUserId,
  now,
}: CreateEventRegistrationInviteInput): EventRegistrationInvite {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    id,
    eventId,
    teamId,
    teamName: teamName.trim(),
    contactEmail: contactEmail.trim().toLowerCase(),
    status,
    tokenHash,
    registrationUrl: `${normalizedBaseUrl}/register/events/${eventId}?token=${encodeURIComponent(token)}`,
    createdByUserId,
    createdAt: now,
    updatedAt: now,
  };
}

export function acceptEventRegistrationInvite({
  invite,
  team,
  seed,
  now,
}: AcceptEventRegistrationInviteInput): { invite: EventRegistrationInvite; entry: EventEntry } {
  return {
    invite: {
      ...invite,
      teamId: team.id,
      teamName: team.name,
      status: 'REGISTERED',
      acceptedAt: now,
      updatedAt: now,
    },
    entry: {
      id: `entry-${invite.eventId.replace(/^event-/, '')}-${team.slug}`,
      eventId: invite.eventId,
      teamId: team.id,
      entryName: team.shortName,
      shortName: team.shortName,
      seed,
      active: true,
    },
  };
}
