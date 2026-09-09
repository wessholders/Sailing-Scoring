export type Id = string;

export type SeasonTerm = 'FALL' | 'SPRING';

export type EventStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export type RaceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export type SailingRole = 'SKIPPER' | 'CREW';

export type OrganizationType = 'UNIVERSITY' | 'YACHT_CLUB' | 'ASSOCIATION';

export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'TEAM_ADMIN'
  | 'TEAM_MANAGER'
  | 'SAILOR'
  | 'SCORER'
  | 'EVENT_ADMIN';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export type ScoringProfileCode = 'ICSA_FLEET';

export type RaceResultStatusCode =
  | 'DNC'
  | 'DNS'
  | 'OCS'
  | 'DNF'
  | 'DSQ'
  | 'BKD'
  | 'BYE';

export type User = {
  id: Id;
  name: string;
  email: string;
  image?: string;
  linkedSailorId?: Id;
  createdAt: string;
  updatedAt: string;
};

export type Organization = {
  id: Id;
  name: string;
  shortName: string;
  slug: string;
  type: OrganizationType;
  primaryTeamId?: Id;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationUserRole = {
  id: Id;
  organizationId: Id;
  userId: Id;
  role: 'ORGANIZATION_ADMIN';
};

export type Sailor = {
  id: Id;
  firstName: string;
  lastName: string;
  preferredName?: string;
  graduationYear: number;
  slug: string;
  linkedUserId?: Id;
  createdAt: string;
  updatedAt: string;
};

export type Conference = {
  id: Id;
  name: string;
  shortName: string;
  slug: string;
};

export type Team = {
  id: Id;
  organizationId?: Id;
  name: string;
  shortName: string;
  slug: string;
  conferenceId?: Id;
  logoUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Season = {
  id: Id;
  name: string;
  year: number;
  term: SeasonTerm;
  startDate: string;
  endDate: string;
};

export type TeamMembership = {
  id: Id;
  teamId: Id;
  sailorId: Id;
  invitedByUserId?: Id;
  sourceInvitationId?: Id;
  startSeasonId: Id;
  endSeasonId?: Id;
  active: boolean;
};

export type TeamInvitation = {
  id: Id;
  teamId: Id;
  email: string;
  intendedRole: 'SAILOR' | 'TEAM_MANAGER' | 'TEAM_ADMIN';
  sailorId?: Id;
  invitedByUserId: Id;
  tokenHash: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SailorAccountLink = {
  id: Id;
  sailorId: Id;
  userId: Id;
  sourceInvitationId?: Id;
  verifiedAt: string;
};

export type TeamBoat = {
  id: Id;
  teamId: Id;
  boatClass: string;
  hullNumber?: string;
  hullName?: string;
  sailNumber: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScoringProfile = {
  id: Id;
  name: string;
  code: ScoringProfileCode;
  description: string;
};

export type Event = {
  id: Id;
  name: string;
  slug: string;
  seasonId: Id;
  hostTeamId?: Id;
  startDate: string;
  endDate: string;
  location: string;
  boatClass: string;
  status: EventStatus;
  scoringProfileId: Id;
  numberOfDivisions: number;
  public: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventEntry = {
  id: Id;
  eventId: Id;
  teamId: Id;
  entryName: string;
  shortName?: string;
  seed?: number;
  active: boolean;
};

export type Division = {
  id: Id;
  eventId: Id;
  name: string;
  code: string;
  displayOrder: number;
};

export type Race = {
  id: Id;
  eventId: Id;
  divisionId: Id;
  raceNumber: number;
  status: RaceStatus;
  startedAt?: string;
  completedAt?: string;
  countsTowardStandings: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RaceResult = {
  id: Id;
  raceId: Id;
  eventEntryId: Id;
  finishPosition: number | null;
  statusCode: RaceResultStatusCode | null;
  calculatedPoints?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SailingAssignment = {
  id: Id;
  eventEntryId: Id;
  divisionId: Id;
  sailorId: Id;
  role: SailingRole;
  startRaceNumber: number;
  endRaceNumber?: number;
};

export type UserTeamRole = {
  id: Id;
  userId: Id;
  teamId: Id;
  role: 'TEAM_MANAGER' | 'TEAM_ADMIN';
};

export type EventUserRole = {
  id: Id;
  userId: Id;
  eventId: Id;
  role: 'SCORER' | 'EVENT_ADMIN';
};

export type AuditLogEntry = {
  id: Id;
  actor: string;
  action: string;
  entityType: string;
  entityId: Id;
  oldValue: string;
  newValue: string;
  timestamp: string;
};
