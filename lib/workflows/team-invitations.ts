import type {
  Sailor,
  SailorAccountLink,
  TeamInvitation,
  TeamMembership,
  User,
  UserTeamRole,
} from '../domain';

export type CreateTeamInvitationInput = {
  id: string;
  teamId: string;
  email: string;
  intendedRole: TeamInvitation['intendedRole'];
  invitedByUserId: string;
  tokenHash: string;
  now: string;
  expiresAt: string;
  sailorId?: string;
};

export type AcceptTeamInvitationInput = {
  invitation: TeamInvitation;
  user: User;
  seasonId: string;
  now: string;
  sailor?: Sailor;
};

export type AcceptedTeamInvitation = {
  invitation: TeamInvitation;
  membership?: TeamMembership;
  sailorAccountLink?: SailorAccountLink;
  teamRole?: UserTeamRole;
};

export function createTeamInvitation(input: CreateTeamInvitationInput): TeamInvitation {
  return {
    id: input.id,
    teamId: input.teamId,
    email: input.email.trim().toLowerCase(),
    intendedRole: input.intendedRole,
    sailorId: input.sailorId,
    invitedByUserId: input.invitedByUserId,
    tokenHash: input.tokenHash,
    status: 'PENDING',
    expiresAt: input.expiresAt,
    createdAt: input.now,
    updatedAt: input.now,
  };
}

export function acceptTeamInvitation({
  invitation,
  user,
  seasonId,
  now,
  sailor,
}: AcceptTeamInvitationInput): AcceptedTeamInvitation {
  if (invitation.status !== 'PENDING') {
    throw new Error('Only pending invitations can be accepted.');
  }

  if (new Date(invitation.expiresAt).getTime() < new Date(now).getTime()) {
    throw new Error('Invitation has expired.');
  }

  const acceptedInvitation: TeamInvitation = {
    ...invitation,
    status: 'ACCEPTED',
    acceptedAt: now,
    updatedAt: now,
  };

  if (invitation.intendedRole === 'TEAM_MANAGER' || invitation.intendedRole === 'TEAM_ADMIN') {
    return {
      invitation: acceptedInvitation,
      teamRole: {
        id: `team-role-${invitation.id}-${user.id}`,
        userId: user.id,
        teamId: invitation.teamId,
        role: invitation.intendedRole,
      },
    };
  }

  const linkedSailorId = invitation.sailorId ?? sailor?.id;

  if (!linkedSailorId) {
    throw new Error('A sailor invitation must resolve to a sailor profile.');
  }

  return {
    invitation: acceptedInvitation,
    membership: {
      id: `membership-${invitation.id}-${linkedSailorId}`,
      teamId: invitation.teamId,
      sailorId: linkedSailorId,
      invitedByUserId: invitation.invitedByUserId,
      sourceInvitationId: invitation.id,
      startSeasonId: seasonId,
      active: true,
    },
    sailorAccountLink: {
      id: `sailor-link-${invitation.id}-${user.id}`,
      sailorId: linkedSailorId,
      userId: user.id,
      sourceInvitationId: invitation.id,
      verifiedAt: now,
    },
  };
}
