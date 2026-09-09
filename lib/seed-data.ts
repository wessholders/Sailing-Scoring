import type {
  AuditLogEntry,
  Conference,
  Division,
  Event,
  EventEntry,
  EventUserRole,
  Organization,
  OrganizationUserRole,
  Race,
  RaceResult,
  RaceResultStatusCode,
  Sailor,
  SailorAccountLink,
  SailingAssignment,
  Season,
  Team,
  TeamBoat,
  TeamInvitation,
  TeamMembership,
  User,
  UserTeamRole,
} from './domain';
import { defaultScoringEngine, icsaFleetProfile } from './scoring/index.ts';

const now = '2026-09-09T12:00:00.000Z';

export const seasons: Season[] = [
  {
    id: 'season-fall-2026',
    name: 'Fall 2026',
    year: 2026,
    term: 'FALL',
    startDate: '2026-08-20',
    endDate: '2026-12-15',
  },
  {
    id: 'season-spring-2027',
    name: 'Spring 2027',
    year: 2027,
    term: 'SPRING',
    startDate: '2027-01-15',
    endDate: '2027-05-25',
  },
];

export const conferences: Conference[] = [
  { id: 'conf-mcsa', name: 'Midwest Collegiate Sailing Association', shortName: 'MCSA', slug: 'mcsa' },
  { id: 'conf-neisa', name: 'New England Intercollegiate Sailing Association', shortName: 'NEISA', slug: 'neisa' },
  { id: 'conf-maisa', name: 'Middle Atlantic Intercollegiate Sailing Association', shortName: 'MAISA', slug: 'maisa' },
  { id: 'conf-saisa', name: 'South Atlantic Intercollegiate Sailing Association', shortName: 'SAISA', slug: 'saisa' },
];

export const organizations: Organization[] = [
  organization('org-wisconsin', 'University of Wisconsin', 'Wisconsin', 'wisconsin', 'UNIVERSITY', 'team-wisconsin'),
  organization('org-michigan', 'University of Michigan', 'Michigan', 'michigan', 'UNIVERSITY', 'team-michigan'),
  organization('org-northwestern', 'Northwestern University', 'Northwestern', 'northwestern', 'UNIVERSITY', 'team-northwestern'),
  organization('org-purdue', 'Purdue University', 'Purdue', 'purdue', 'UNIVERSITY', 'team-purdue'),
  organization('org-notre-dame', 'University of Notre Dame', 'Notre Dame', 'notre-dame', 'UNIVERSITY', 'team-notre-dame'),
  organization('org-marquette', 'Marquette University', 'Marquette', 'marquette', 'UNIVERSITY', 'team-marquette'),
  organization('org-yale', 'Yale University', 'Yale', 'yale', 'UNIVERSITY', 'team-yale'),
  organization('org-georgetown', 'Georgetown University', 'Georgetown', 'georgetown', 'UNIVERSITY', 'team-georgetown'),
  organization('org-tulane', 'Tulane University', 'Tulane', 'tulane', 'UNIVERSITY', 'team-tulane'),
  organization('org-charleston', 'College of Charleston', 'Charleston', 'charleston', 'UNIVERSITY', 'team-charleston'),
  organization('org-tennessee', 'University of Tennessee', 'Tennessee', 'tennessee', 'UNIVERSITY', 'team-tennessee'),
  organization('org-lakewood-yc', 'Lakewood Yacht Club', 'Lakewood YC', 'lakewood-yacht-club', 'YACHT_CLUB'),
];

export const teams: Team[] = [
  team('team-wisconsin', 'University of Wisconsin', 'Wisconsin', 'wisconsin', 'conf-mcsa', 'org-wisconsin'),
  team('team-michigan', 'University of Michigan', 'Michigan', 'michigan', 'conf-mcsa', 'org-michigan'),
  team('team-northwestern', 'Northwestern University', 'Northwestern', 'northwestern', 'conf-mcsa', 'org-northwestern'),
  team('team-purdue', 'Purdue University', 'Purdue', 'purdue', 'conf-mcsa', 'org-purdue'),
  team('team-notre-dame', 'University of Notre Dame', 'Notre Dame', 'notre-dame', 'conf-mcsa', 'org-notre-dame'),
  team('team-marquette', 'Marquette University', 'Marquette', 'marquette', 'conf-mcsa', 'org-marquette'),
  team('team-yale', 'Yale University', 'Yale', 'yale', 'conf-neisa', 'org-yale'),
  team('team-georgetown', 'Georgetown University', 'Georgetown', 'georgetown', 'conf-maisa', 'org-georgetown'),
  team('team-tulane', 'Tulane University', 'Tulane', 'tulane', 'conf-saisa', 'org-tulane'),
  team('team-charleston', 'College of Charleston', 'Charleston', 'charleston', 'conf-saisa', 'org-charleston'),
  team('team-tennessee', 'University of Tennessee', 'Tennessee', 'tennessee', 'conf-saisa', 'org-tennessee'),
];

const sailorNamesByTeam: Record<string, Array<[string, string, number]>> = {
  'team-wisconsin': [['Jane', 'Bennett', 2028], ['Alex', 'Reed', 2027], ['Ryan', 'Hall', 2026], ['Mia', 'Larson', 2029]],
  'team-michigan': [['Clara', 'Wells', 2027], ['Owen', 'Fischer', 2028], ['Nate', 'Hughes', 2026], ['Priya', 'Shah', 2029]],
  'team-northwestern': [['Elena', 'Park', 2028], ['Sam', 'Mercer', 2027], ['Grace', 'Lin', 2026], ['Theo', 'Mason', 2029]],
  'team-purdue': [['Ava', 'Price', 2027], ['Caleb', 'Norris', 2028], ['Lina', 'Voss', 2026], ['Miles', 'Grant', 2029]],
  'team-notre-dame': [['Sophie', 'Keane', 2028], ['Jack', 'Dolan', 2027], ['Amara', 'Cole', 2026], ['Ben', 'Sullivan', 2029]],
  'team-marquette': [['Isabel', 'Rocha', 2027], ['Henry', 'Walsh', 2028], ['Maya', 'Ortiz', 2026], ['Finn', 'Carver', 2029]],
  'team-yale': [['Audrey', 'Kim', 2028], ['Miles', 'Chen', 2027], ['Leah', 'Stone', 2026], ['Isaac', 'Morgan', 2029]],
  'team-georgetown': [['Nora', 'Fields', 2027], ['Dylan', 'Brooks', 2028], ['Tessa', 'Moore', 2026], ['Julian', 'Fox', 2029]],
  'team-tulane': [['Camille', 'Martin', 2028], ['Evan', 'Boudreaux', 2027], ['Zoe', 'Nguyen', 2026], ['Peter', 'Adams', 2029]],
  'team-charleston': [['Hannah', 'Lee', 2027], ['Cole', 'Rivers', 2028], ['Ivy', 'Walker', 2026], ['Noah', 'Bell', 2029]],
  'team-tennessee': [['Maddie', 'Clark', 2028], ['Eli', 'Turner', 2027], ['Riley', 'Brooks', 2026], ['June', 'Carter', 2029]],
};

export const sailors: Sailor[] = Object.entries(sailorNamesByTeam).flatMap(
  ([teamId, names]) =>
    names.map(([firstName, lastName, graduationYear], index) => ({
      id: `${teamId}-sailor-${index + 1}`,
      firstName,
      lastName,
      preferredName: firstName,
      graduationYear,
      slug: `${firstName}-${lastName}`.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    })),
);

export const teamMemberships: TeamMembership[] = sailors.map((sailor) => ({
  id: `membership-${sailor.id}`,
  teamId: sailor.id.split('-sailor-')[0],
  sailorId: sailor.id,
  invitedByUserId: 'user-manager-wisconsin',
  startSeasonId: 'season-fall-2026',
  active: true,
}));

export const scoringProfiles = [icsaFleetProfile];

export const events: Event[] = [
  {
    id: 'event-fall-fury-2026',
    name: 'Fall Fury 2026',
    slug: 'fall-fury-2026',
    seasonId: 'season-fall-2026',
    hostTeamId: 'team-wisconsin',
    startDate: '2026-09-12',
    endDate: '2026-09-13',
    location: 'Lake Mendota, Madison, WI',
    boatClass: '420',
    status: 'LIVE',
    scoringProfileId: icsaFleetProfile.id,
    numberOfDivisions: 2,
    public: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'event-atlantic-coast-tune-up',
    name: 'Atlantic Coast Tune-Up',
    slug: 'atlantic-coast-tune-up',
    seasonId: 'season-fall-2026',
    hostTeamId: 'team-georgetown',
    startDate: '2026-08-29',
    endDate: '2026-08-30',
    location: 'Washington Sailing Marina, Alexandria, VA',
    boatClass: 'FJ',
    status: 'COMPLETED',
    scoringProfileId: icsaFleetProfile.id,
    numberOfDivisions: 2,
    public: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'event-great-lakes-invitational',
    name: 'Great Lakes Invitational',
    slug: 'great-lakes-invitational',
    seasonId: 'season-fall-2026',
    hostTeamId: 'team-michigan',
    startDate: '2026-10-03',
    endDate: '2026-10-04',
    location: 'Baseline Lake, Dexter, MI',
    boatClass: '420',
    status: 'UPCOMING',
    scoringProfileId: icsaFleetProfile.id,
    numberOfDivisions: 2,
    public: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const eventEntries: EventEntry[] = [
  ...teams.slice(0, 10).map((entryTeam, index) => ({
    id: `entry-fall-fury-${entryTeam.slug}`,
    eventId: 'event-fall-fury-2026',
    teamId: entryTeam.id,
    entryName: entryTeam.shortName,
    shortName: entryTeam.shortName,
    seed: index + 1,
    active: true,
  })),
  {
    id: 'entry-fall-fury-wisconsin-cardinal',
    eventId: 'event-fall-fury-2026',
    teamId: 'team-wisconsin',
    entryName: 'Wisconsin Cardinal',
    shortName: 'Wisc Cardinal',
    seed: 11,
    active: true,
  },
];

export const divisions: Division[] = [
  { id: 'division-fall-fury-a', eventId: 'event-fall-fury-2026', name: 'A Division', code: 'A', displayOrder: 1 },
  { id: 'division-fall-fury-b', eventId: 'event-fall-fury-2026', name: 'B Division', code: 'B', displayOrder: 2 },
];

export const races: Race[] = [
  ...makeRaces('event-fall-fury-2026', 'division-fall-fury-a', 'A', 6, 5),
  ...makeRaces('event-fall-fury-2026', 'division-fall-fury-b', 'B', 6, 5),
];

const aFinishes = [
  [2, 1, 4, 5, 6, 7, 3, 8, 9, 10, 11],
  [1, 4, 2, 6, 7, 5, 3, 8, 9, 10, 11],
  [3, 2, 1, 5, 7, 6, 4, 8, 9, 10, 11],
  [2, 3, 4, 1, 7, 5, 6, 8, 9, 10, 11],
  [1, 2, 5, 3, 7, 6, 4, 8, 9, 10, 11],
];

const bFinishes = [
  [3, 2, 1, 5, 4, 6, 7, 8, 9, 10, 11],
  [2, 1, 4, 3, 5, 8, 6, 7, 9, 10, 11],
  [4, 3, 2, 1, 5, 6, 7, 8, 9, 10, 11],
  [1, 4, 3, 2, 6, 5, 8, 7, 9, 10, 11],
  [2, 3, 1, 4, 6, 5, 7, 8, 9, 10, 11],
];

const statusOverrides: Record<string, RaceResultStatusCode> = {
  'race-division-fall-fury-a-2:entry-fall-fury-notre-dame': 'OCS',
  'race-division-fall-fury-a-3:entry-fall-fury-marquette': 'DNF',
  'race-division-fall-fury-a-4:entry-fall-fury-georgetown': 'DSQ',
  'race-division-fall-fury-b-2:entry-fall-fury-charleston': 'DNS',
  'race-division-fall-fury-b-4:entry-fall-fury-yale': 'BKD',
  'race-division-fall-fury-b-5:entry-fall-fury-wisconsin-cardinal': 'BYE',
};

export const raceResults: RaceResult[] = [
  ...makeResults('division-fall-fury-a', aFinishes),
  ...makeResults('division-fall-fury-b', bFinishes),
];

export const sailingAssignments: SailingAssignment[] = makeAssignments();

export const users: User[] = [
  {
    id: 'user-admin',
    name: 'Morgan Blake',
    email: 'admin@sail.test',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'user-scorer',
    name: 'Casey Lane',
    email: 'scorer@sail.test',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'user-manager-wisconsin',
    name: 'Taylor Finch',
    email: 'manager@sail.test',
    createdAt: now,
    updatedAt: now,
  },
];

export const organizationUserRoles: OrganizationUserRole[] = [
  {
    id: 'our-wisconsin-admin',
    organizationId: 'org-wisconsin',
    userId: 'user-manager-wisconsin',
    role: 'ORGANIZATION_ADMIN',
  },
];

export const userTeamRoles: UserTeamRole[] = [
  {
    id: 'utr-wisconsin-manager',
    userId: 'user-manager-wisconsin',
    teamId: 'team-wisconsin',
    role: 'TEAM_ADMIN',
  },
];

export const teamInvitations: TeamInvitation[] = [
  {
    id: 'invite-wisconsin-jane',
    teamId: 'team-wisconsin',
    email: 'jane.bennett@example.edu',
    intendedRole: 'SAILOR',
    sailorId: 'team-wisconsin-sailor-1',
    invitedByUserId: 'user-manager-wisconsin',
    tokenHash: 'sha256-demo-jane-bennett',
    status: 'PENDING',
    expiresAt: '2026-10-01T00:00:00.000Z',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'invite-wisconsin-assistant',
    teamId: 'team-wisconsin',
    email: 'assistant.coach@example.edu',
    intendedRole: 'TEAM_MANAGER',
    invitedByUserId: 'user-manager-wisconsin',
    tokenHash: 'sha256-demo-assistant-coach',
    status: 'PENDING',
    expiresAt: '2026-10-01T00:00:00.000Z',
    createdAt: now,
    updatedAt: now,
  },
];

export const sailorAccountLinks: SailorAccountLink[] = [
  {
    id: 'link-wisconsin-alex',
    sailorId: 'team-wisconsin-sailor-2',
    userId: 'user-manager-wisconsin',
    sourceInvitationId: 'invite-wisconsin-jane',
    verifiedAt: '2026-09-01T15:30:00.000Z',
  },
];

export const teamBoats: TeamBoat[] = [
  boat('boat-wisconsin-420-1', 'team-wisconsin', '420', 'UW-01', 'Mendota One', 'USA 8124'),
  boat('boat-wisconsin-420-2', 'team-wisconsin', '420', 'UW-02', 'Bascom', 'USA 8172'),
  boat('boat-wisconsin-fj-1', 'team-wisconsin', 'FJ', 'UW-FJ-4', 'Cardinal', 'USA 5211'),
];

export const eventUserRoles: EventUserRole[] = [
  {
    id: 'eur-fall-fury-scorer',
    userId: 'user-scorer',
    eventId: 'event-fall-fury-2026',
    role: 'SCORER',
  },
  {
    id: 'eur-fall-fury-admin',
    userId: 'user-admin',
    eventId: 'event-fall-fury-2026',
    role: 'EVENT_ADMIN',
  },
];

export const auditLog: AuditLogEntry[] = [
  {
    id: 'audit-1',
    actor: 'Casey Lane',
    action: 'race result changed',
    entityType: 'RaceResult',
    entityId: 'result-race-division-fall-fury-a-2-entry-fall-fury-notre-dame',
    oldValue: 'finishPosition=7,status=null',
    newValue: 'finishPosition=null,status=OCS',
    timestamp: '2026-09-12T16:18:00.000Z',
  },
  {
    id: 'audit-2',
    actor: 'Morgan Blake',
    action: 'entry changed',
    entityType: 'EventEntry',
    entityId: 'entry-fall-fury-wisconsin-cardinal',
    oldValue: 'inactive',
    newValue: 'active',
    timestamp: '2026-09-12T13:42:00.000Z',
  },
];

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function getTeamById(id: string) {
  return teams.find((teamItem) => teamItem.id === id);
}

export function getTeamBySlug(slug: string) {
  return teams.find((teamItem) => teamItem.slug === slug);
}

export function getSailorById(id: string) {
  return sailors.find((sailor) => sailor.id === id);
}

export function getSailorBySlug(slug: string) {
  return sailors.find((sailor) => sailor.slug === slug);
}

export function getConferenceById(id?: string) {
  return conferences.find((conference) => conference.id === id);
}

export function getSeasonById(id: string) {
  return seasons.find((season) => season.id === id);
}

export function getEventEntries(eventId: string) {
  return eventEntries
    .filter((entry) => entry.eventId === eventId && entry.active)
    .sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));
}

export function getEventDivisions(eventId: string) {
  return divisions
    .filter((division) => division.eventId === eventId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getEventRaces(eventId: string) {
  return races
    .filter((race) => race.eventId === eventId)
    .sort((a, b) => a.divisionId.localeCompare(b.divisionId) || a.raceNumber - b.raceNumber);
}

export function getEventResults(eventId: string) {
  const raceIds = new Set(getEventRaces(eventId).map((race) => race.id));
  return raceResults.filter((result) => raceIds.has(result.raceId));
}

export function getEventStandings(eventId: string) {
  return defaultScoringEngine.calculateOverallStandings({
    divisions: getEventDivisions(eventId),
    eventEntries: getEventEntries(eventId),
    races: getEventRaces(eventId),
    results: getEventResults(eventId),
  });
}

export function getDivisionStandings(eventId: string, divisionId: string) {
  const division = divisions.find((item) => item.id === divisionId);

  if (!division) {
    return [];
  }

  return defaultScoringEngine.calculateDivisionStandings({
    division,
    eventEntries: getEventEntries(eventId),
    races: getEventRaces(eventId),
    results: getEventResults(eventId),
  });
}

export function getRosterForTeam(teamId: string) {
  return teamMemberships
    .filter((membership) => membership.teamId === teamId && membership.active)
    .map((membership) => getSailorById(membership.sailorId))
    .filter((sailor): sailor is Sailor => Boolean(sailor));
}

export function getAssignmentsForEntry(entryId: string) {
  return sailingAssignments
    .filter((assignment) => assignment.eventEntryId === entryId)
    .sort((a, b) => a.divisionId.localeCompare(b.divisionId) || a.startRaceNumber - b.startRaceNumber);
}

export function getTeamInvitations(teamId: string) {
  return teamInvitations.filter((invite) => invite.teamId === teamId);
}

export function getTeamBoats(teamId: string) {
  return teamBoats.filter((boatItem) => boatItem.teamId === teamId && boatItem.active);
}

export function getTeamResults(teamId: string) {
  return eventEntries
    .filter((entry) => entry.teamId === teamId)
    .map((entry) => {
      const event = events.find((candidate) => candidate.id === entry.eventId);
      const standing = getEventStandings(entry.eventId).find(
        (row) => row.eventEntryId === entry.id,
      );
      return event && standing ? { event, entry, standing } : null;
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
}

export function getSailorHistory(sailorId: string) {
  return sailingAssignments
    .filter((assignment) => assignment.sailorId === sailorId)
    .map((assignment) => {
      const entry = eventEntries.find((candidate) => candidate.id === assignment.eventEntryId);
      const event = entry ? events.find((candidate) => candidate.id === entry.eventId) : undefined;
      const division = divisions.find((candidate) => candidate.id === assignment.divisionId);
      return entry && event && division ? { assignment, entry, event, division } : null;
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
}

export function formatDateRange(event: Pick<Event, 'startDate' | 'endDate'>) {
  const start = new Date(`${event.startDate}T00:00:00`);
  const end = new Date(`${event.endDate}T00:00:00`);
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: start.getFullYear() === end.getFullYear() ? undefined : 'numeric',
  });

  return `${formatter.format(start)}-${formatter.format(end)}, ${end.getFullYear()}`;
}

export function raceProgress(eventId: string) {
  const eventRaces = getEventRaces(eventId);
  const completed = eventRaces.filter((race) => race.status === 'COMPLETED').length;
  return `${completed}/${eventRaces.length} races scored`;
}

function team(
  id: string,
  name: string,
  shortName: string,
  slug: string,
  conferenceId: string,
  organizationId?: string,
): Team {
  return {
    id,
    organizationId,
    name,
    shortName,
    slug,
    conferenceId,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}

function organization(
  id: string,
  name: string,
  shortName: string,
  slug: string,
  type: 'UNIVERSITY' | 'YACHT_CLUB' | 'ASSOCIATION',
  primaryTeamId?: string,
): Organization {
  return {
    id,
    name,
    shortName,
    slug,
    type,
    primaryTeamId,
    createdAt: now,
    updatedAt: now,
  };
}

function boat(
  id: string,
  teamId: string,
  boatClass: string,
  hullNumber: string,
  hullName: string,
  sailNumber: string,
): TeamBoat {
  return {
    id,
    teamId,
    boatClass,
    hullNumber,
    hullName,
    sailNumber,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}

function makeRaces(
  eventId: string,
  divisionId: string,
  code: string,
  count: number,
  completedCount: number,
): Race[] {
  return Array.from({ length: count }, (_, index) => {
    const raceNumber = index + 1;
    const completed = raceNumber <= completedCount;
    return {
      id: `race-${divisionId}-${raceNumber}`,
      eventId,
      divisionId,
      raceNumber,
      status: completed ? 'COMPLETED' : 'IN_PROGRESS',
      startedAt: `2026-09-12T${String(13 + index).padStart(2, '0')}:05:00.000Z`,
      completedAt: completed ? `2026-09-12T${String(13 + index).padStart(2, '0')}:42:00.000Z` : undefined,
      countsTowardStandings: completed,
      createdAt: now,
      updatedAt: now,
    };
  });
}

function makeResults(divisionId: string, finishes: number[][]): RaceResult[] {
  return finishes.flatMap((raceFinishes, raceIndex) => {
    const raceId = `race-${divisionId}-${raceIndex + 1}`;
    return eventEntries.map((entry, entryIndex) => {
      const override = statusOverrides[`${raceId}:${entry.id}`] ?? null;
      return {
        id: `result-${raceId}-${entry.id}`,
        raceId,
        eventEntryId: entry.id,
        finishPosition: override ? null : raceFinishes[entryIndex],
        statusCode: override,
        notes: override ? `${override} recorded by scorer` : undefined,
        createdAt: now,
        updatedAt: now,
      };
    });
  });
}

function makeAssignments(): SailingAssignment[] {
  return eventEntries.flatMap((entry, entryIndex) => {
    const teamRoster = getRosterForTeam(entry.teamId);
    const skipperA = teamRoster[0];
    const crewA = teamRoster[1];
    const skipperB = teamRoster[2] ?? teamRoster[0];
    const crewB = teamRoster[3] ?? teamRoster[1];
    const base = [
      assignment(entry.id, 'division-fall-fury-a', skipperA?.id, 'SKIPPER', 1),
      assignment(entry.id, 'division-fall-fury-a', crewA?.id, 'CREW', 1),
      assignment(entry.id, 'division-fall-fury-b', skipperB?.id, 'SKIPPER', 1),
      assignment(entry.id, 'division-fall-fury-b', crewB?.id, 'CREW', 1),
    ];

    if (entryIndex === 0 && teamRoster[2]) {
      base[0] = assignment(entry.id, 'division-fall-fury-a', skipperA?.id, 'SKIPPER', 1, 4);
      base.push(assignment(entry.id, 'division-fall-fury-a', teamRoster[2].id, 'SKIPPER', 5));
    }

    return base.filter((item): item is SailingAssignment => Boolean(item));
  });
}

function assignment(
  eventEntryId: string,
  divisionId: string,
  sailorId: string | undefined,
  role: 'SKIPPER' | 'CREW',
  startRaceNumber: number,
  endRaceNumber?: number,
): SailingAssignment | null {
  if (!sailorId) {
    return null;
  }

  return {
    id: `assignment-${eventEntryId}-${divisionId}-${sailorId}-${startRaceNumber}`,
    eventEntryId,
    divisionId,
    sailorId,
    role,
    startRaceNumber,
    endRaceNumber,
  };
}
