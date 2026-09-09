import assert from 'node:assert/strict';
import test from 'node:test';
import type { Division, EventEntry, Race, RaceResult } from '../lib/domain.ts';
import { defaultScoringEngine } from '../lib/scoring/index.ts';
import {
  eventEntries,
  getAssignmentsForEntry,
  getEventStandings,
  raceResults,
} from '../lib/seed-data.ts';
import {
  acceptTeamInvitation,
  createTeamInvitation,
} from '../lib/workflows/team-invitations.ts';

const entries: EventEntry[] = [
  entry('entry-alpha', 'team-alpha'),
  entry('entry-bravo', 'team-bravo'),
  entry('entry-charlie', 'team-charlie'),
];
const division: Division = {
  id: 'division-a',
  eventId: 'event-test',
  name: 'A Division',
  code: 'A',
  displayOrder: 1,
};
const races: Race[] = [race('race-a-1', 1), race('race-a-2', 2)];

test('numeric low-point scoring maps finish position to points', () => {
  assert.equal(
    defaultScoringEngine.calculateRacePoints(
      { eventEntryId: 'entry-alpha', finishPosition: 1, statusCode: null },
      3,
    ),
    1,
  );
  assert.equal(
    defaultScoringEngine.calculateRacePoints(
      { eventEntryId: 'entry-alpha', finishPosition: 2, statusCode: null },
      3,
    ),
    2,
  );
  assert.equal(
    defaultScoringEngine.calculateRacePoints(
      { eventEntryId: 'entry-alpha', finishPosition: 3, statusCode: null },
      3,
    ),
    3,
  );
});

test('no throwouts are applied to division totals', () => {
  const standings = defaultScoringEngine.calculateDivisionStandings({
    division,
    eventEntries: entries,
    races,
    results: [
      result('race-a-1', 'entry-alpha', 1),
      result('race-a-2', 'entry-alpha', 3),
      result('race-a-1', 'entry-bravo', 2),
      result('race-a-2', 'entry-bravo', 2),
      result('race-a-1', 'entry-charlie', 3),
      result('race-a-2', 'entry-charlie', 1),
    ],
  });

  assert.equal(standings.find((row) => row.eventEntryId === 'entry-alpha')?.total, 4);
});

test('penalty statuses score fleet size plus one', () => {
  for (const statusCode of ['DNC', 'DNS', 'OCS', 'DNF', 'DSQ'] as const) {
    assert.equal(
      defaultScoringEngine.calculateRacePoints(
        { eventEntryId: 'entry-alpha', finishPosition: null, statusCode },
        10,
      ),
      11,
    );
  }
});

test('multiple divisions combine into an overall score', () => {
  const divisionB: Division = { ...division, id: 'division-b', code: 'B', name: 'B Division' };
  const overall = defaultScoringEngine.calculateOverallStandings({
    divisions: [division, divisionB],
    eventEntries: entries,
    races: [
      race('race-a-1', 1, division.id),
      race('race-b-1', 1, divisionB.id),
    ],
    results: [
      result('race-a-1', 'entry-alpha', 1),
      result('race-b-1', 'entry-alpha', 2),
      result('race-a-1', 'entry-bravo', 2),
      result('race-b-1', 'entry-bravo', 1),
      result('race-a-1', 'entry-charlie', 3),
      result('race-b-1', 'entry-charlie', 3),
    ],
  });

  assert.equal(overall.find((row) => row.eventEntryId === 'entry-alpha')?.total, 3);
});

test('series ties resolve by best finishes before latest-race comparison', () => {
  const standings = defaultScoringEngine.calculateDivisionStandings({
    division,
    eventEntries: entries.slice(0, 2),
    races,
    results: [
      result('race-a-1', 'entry-alpha', 1),
      result('race-a-2', 'entry-alpha', 3),
      result('race-a-1', 'entry-bravo', 2),
      result('race-a-2', 'entry-bravo', 2),
    ],
  });

  assert.equal(standings[0].eventEntryId, 'entry-alpha');
  assert.equal(standings[0].total, standings[1].total);
});

test('unresolved ties keep shared places marked as tied', () => {
  const standings = defaultScoringEngine.calculateDivisionStandings({
    division,
    eventEntries: entries.slice(0, 2),
    races,
    results: [
      result('race-a-1', 'entry-alpha', 1),
      result('race-a-2', 'entry-alpha', 2),
      result('race-a-1', 'entry-bravo', 1),
      result('race-a-2', 'entry-bravo', 2),
    ],
  });

  assert.equal(standings[0].place, 1);
  assert.equal(standings[1].place, 1);
  assert.equal(standings[0].tied, true);
  assert.equal(standings[1].tied, true);
});

test('race editing recalculates standings from source results', () => {
  const initialResults = [
    result('race-a-1', 'entry-alpha', 1),
    result('race-a-2', 'entry-alpha', 1),
    result('race-a-1', 'entry-bravo', 2),
    result('race-a-2', 'entry-bravo', 2),
  ];
  const editedResults = initialResults.map((item) =>
    item.raceId === 'race-a-2' && item.eventEntryId === 'entry-alpha'
      ? { ...item, finishPosition: 4 }
      : item,
  );

  const initial = defaultScoringEngine.calculateDivisionStandings({
    division,
    eventEntries: entries.slice(0, 2),
    races,
    results: initialResults,
  });
  const edited = defaultScoringEngine.calculateDivisionStandings({
    division,
    eventEntries: entries.slice(0, 2),
    races,
    results: editedResults,
  });

  assert.equal(initial[0].eventEntryId, 'entry-alpha');
  assert.equal(edited[0].eventEntryId, 'entry-bravo');
});

test('multiple event entries from one team remain independent competitors', () => {
  const wisconsinEntries = eventEntries.filter((entryItem) => entryItem.teamId === 'team-wisconsin');

  assert.equal(wisconsinEntries.length, 2);

  const standings = getEventStandings('event-fall-fury-2026');
  assert.ok(standings.find((row) => row.eventEntryId === 'entry-fall-fury-wisconsin'));
  assert.ok(standings.find((row) => row.eventEntryId === 'entry-fall-fury-wisconsin-cardinal'));
});

test('sailor substitutions can cover different race ranges in one division', () => {
  const assignments = getAssignmentsForEntry('entry-fall-fury-wisconsin').filter(
    (assignment) => assignment.divisionId === 'division-fall-fury-a' && assignment.role === 'SKIPPER',
  );

  assert.equal(assignments.length, 2);
  assert.deepEqual(
    assignments.map((assignment) => [assignment.startRaceNumber, assignment.endRaceNumber ?? null]),
    [
      [1, 4],
      [5, null],
    ],
  );
});

test('seed results include the required initial status-code coverage', () => {
  const statuses = new Set(raceResults.map((resultItem) => resultItem.statusCode).filter(Boolean));

  for (const status of ['DNF', 'OCS', 'DSQ', 'BKD', 'BYE']) {
    assert.ok(statuses.has(status as never), `${status} should exist in seed data`);
  }
});

test('team invitation creation normalizes email and stores token hash only', () => {
  const invitation = createTeamInvitation({
    id: 'invite-demo',
    teamId: 'team-alpha',
    email: ' New.Sailor@Example.edu ',
    intendedRole: 'SAILOR',
    invitedByUserId: 'user-manager',
    tokenHash: 'sha256-token',
    now: '2026-09-09T00:00:00.000Z',
    expiresAt: '2026-10-09T00:00:00.000Z',
    sailorId: 'sailor-alpha',
  });

  assert.equal(invitation.email, 'new.sailor@example.edu');
  assert.equal(invitation.tokenHash, 'sha256-token');
  assert.equal(invitation.status, 'PENDING');
});

test('accepting a sailor invitation creates membership and account link', () => {
  const invitation = createTeamInvitation({
    id: 'invite-sailor',
    teamId: 'team-alpha',
    email: 'sailor@example.edu',
    intendedRole: 'SAILOR',
    invitedByUserId: 'user-manager',
    tokenHash: 'sha256-token',
    now: '2026-09-09T00:00:00.000Z',
    expiresAt: '2026-10-09T00:00:00.000Z',
    sailorId: 'sailor-alpha',
  });
  const accepted = acceptTeamInvitation({
    invitation,
    user: user('user-sailor', 'sailor@example.edu'),
    seasonId: 'season-fall-2026',
    now: '2026-09-10T00:00:00.000Z',
  });

  assert.equal(accepted.invitation.status, 'ACCEPTED');
  assert.equal(accepted.membership?.teamId, 'team-alpha');
  assert.equal(accepted.sailorAccountLink?.sailorId, 'sailor-alpha');
});

test('accepting a manager invitation grants team role without sailor membership', () => {
  const invitation = createTeamInvitation({
    id: 'invite-manager',
    teamId: 'team-alpha',
    email: 'manager@example.edu',
    intendedRole: 'TEAM_MANAGER',
    invitedByUserId: 'user-admin',
    tokenHash: 'sha256-token',
    now: '2026-09-09T00:00:00.000Z',
    expiresAt: '2026-10-09T00:00:00.000Z',
  });
  const accepted = acceptTeamInvitation({
    invitation,
    user: user('user-manager', 'manager@example.edu'),
    seasonId: 'season-fall-2026',
    now: '2026-09-10T00:00:00.000Z',
  });

  assert.equal(accepted.teamRole?.role, 'TEAM_MANAGER');
  assert.equal(accepted.membership, undefined);
});

function entry(id: string, teamId: string): EventEntry {
  return {
    id,
    eventId: 'event-test',
    teamId,
    entryName: id,
    active: true,
  };
}

function race(id: string, raceNumber: number, divisionId = division.id): Race {
  return {
    id,
    eventId: 'event-test',
    divisionId,
    raceNumber,
    status: 'COMPLETED',
    countsTowardStandings: true,
    createdAt: '2026-09-09T00:00:00.000Z',
    updatedAt: '2026-09-09T00:00:00.000Z',
  };
}

function result(raceId: string, eventEntryId: string, finishPosition: number): RaceResult {
  return {
    id: `result-${raceId}-${eventEntryId}`,
    raceId,
    eventEntryId,
    finishPosition,
    statusCode: null,
    createdAt: '2026-09-09T00:00:00.000Z',
    updatedAt: '2026-09-09T00:00:00.000Z',
  };
}

function user(id: string, email: string) {
  return {
    id,
    email,
    name: email,
    createdAt: '2026-09-09T00:00:00.000Z',
    updatedAt: '2026-09-09T00:00:00.000Z',
  };
}
