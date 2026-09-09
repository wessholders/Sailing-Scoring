import type {
  Division,
  EventEntry,
  Race,
  RaceResult,
  RaceResultStatusCode,
  ScoringProfile,
} from '../domain';

export type RaceScore = RaceResult & {
  calculatedPoints: number;
  displayValue: string;
};

export type DivisionStanding = {
  place: number;
  tied: boolean;
  eventEntryId: string;
  divisionId: string;
  total: number;
  scores: RaceScore[];
  tieBreakVector: number[];
};

export type OverallStanding = {
  place: number;
  tied: boolean;
  eventEntryId: string;
  total: number;
  divisionTotals: Record<string, number>;
  tieBreakVector: number[];
};

export type DivisionStandingInput = {
  division: Division;
  eventEntries: EventEntry[];
  races: Race[];
  results: RaceResult[];
};

export type OverallStandingInput = {
  divisions: Division[];
  eventEntries: EventEntry[];
  races: Race[];
  results: RaceResult[];
};

export interface ScoringEngine {
  profile: ScoringProfile;
  calculateRacePoints(
    result: Pick<RaceResult, 'finishPosition' | 'statusCode' | 'eventEntryId'>,
    fleetSize: number,
    context?: { breakdownAverage?: number },
  ): number;
  calculateDivisionStandings(input: DivisionStandingInput): DivisionStanding[];
  calculateOverallStandings(input: OverallStandingInput): OverallStanding[];
  resolveSeriesTies<T extends { total: number; tieBreakVector: number[] }>(
    standings: T[],
  ): T[];
}

export const icsaFleetProfile: ScoringProfile = {
  id: 'profile-icsa-fleet',
  name: 'ICSA Collegiate Fleet Racing',
  code: 'ICSA_FLEET',
  description:
    'Low-point fleet racing with no throwouts in V1. Overall scores are the sum of counted division scores.',
};

const penaltyStatuses = new Set<RaceResultStatusCode>([
  'DNC',
  'DNS',
  'OCS',
  'DNF',
  'DSQ',
]);

function resultKey(raceId: string, eventEntryId: string) {
  return `${raceId}:${eventEntryId}`;
}

function formatPoints(points: number) {
  return Number.isInteger(points) ? points.toString() : points.toFixed(1);
}

function rankSorted<T extends { total: number; tieBreakVector: number[] }>(
  rows: T[],
): Array<T & { place: number; tied: boolean }> {
  const ranked: Array<T & { place: number; tied: boolean }> = [];

  rows.forEach((row, index) => {
    const previous = ranked[index - 1];
    const previousRow = rows[index - 1];
    const next = rows[index + 1];
    const tiedWithPrevious =
      previousRow &&
      row.total === previousRow.total &&
      compareTieVectors(row.tieBreakVector, previousRow.tieBreakVector) === 0;
    const tiedWithNext =
      next &&
      row.total === next.total &&
      compareTieVectors(row.tieBreakVector, next.tieBreakVector) === 0;

    ranked.push({
      ...row,
      place: tiedWithPrevious ? previous.place : index + 1,
      tied: Boolean(tiedWithPrevious || tiedWithNext),
    });
  });

  return ranked;
}

function compareTieVectors(a: number[], b: number[]) {
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const left = a[index] ?? Number.POSITIVE_INFINITY;
    const right = b[index] ?? Number.POSITIVE_INFINITY;

    if (left !== right) {
      return left - right;
    }
  }

  return 0;
}

function buildTieBreakVector(scores: RaceScore[], fleetSize: number) {
  const countedScores = scores.map((score) => score.calculatedPoints);
  const scoreCounts = Array.from({ length: fleetSize + 2 }, (_, score) =>
    countedScores.filter((points) => points === score).length,
  );

  const bestScoreCounts = scoreCounts.slice(1).map((count) => -count);
  const recentRaceScores = [...scores]
    .sort((a, b) => b.raceId.localeCompare(a.raceId))
    .map((score) => score.calculatedPoints);

  return [...bestScoreCounts, ...recentRaceScores];
}

export class IcsaFleetScoringEngine implements ScoringEngine {
  profile = icsaFleetProfile;

  calculateRacePoints(
    result: Pick<RaceResult, 'finishPosition' | 'statusCode' | 'eventEntryId'>,
    fleetSize: number,
    context?: { breakdownAverage?: number },
  ) {
    if (result.statusCode === 'BYE') {
      return 0;
    }

    if (result.statusCode === 'BKD') {
      return context?.breakdownAverage ?? fleetSize + 1;
    }

    if (result.statusCode && penaltyStatuses.has(result.statusCode)) {
      return fleetSize + 1;
    }

    if (typeof result.finishPosition === 'number') {
      return result.finishPosition;
    }

    return fleetSize + 1;
  }

  calculateDivisionStandings({
    division,
    eventEntries,
    races,
    results,
  }: DivisionStandingInput) {
    const countedRaces = races
      .filter(
        (race) =>
          race.divisionId === division.id &&
          race.countsTowardStandings &&
          race.status === 'COMPLETED',
      )
      .sort((a, b) => a.raceNumber - b.raceNumber);
    const resultMap = new Map(
      results.map((result) => [resultKey(result.raceId, result.eventEntryId), result]),
    );

    const numericAverages = new Map<string, number>();
    eventEntries.forEach((entry) => {
      const numericScores = countedRaces
        .map((race) => resultMap.get(resultKey(race.id, entry.id)))
        .filter(
          (result): result is RaceResult =>
            Boolean(result) &&
            result?.statusCode === null &&
            typeof result.finishPosition === 'number',
        )
        .map((result) => result.finishPosition as number);

      if (numericScores.length > 0) {
        numericAverages.set(
          entry.id,
          numericScores.reduce((sum, points) => sum + points, 0) / numericScores.length,
        );
      }
    });

    const rows = eventEntries.map((entry) => {
      const scores = countedRaces.map((race) => {
        const raw = resultMap.get(resultKey(race.id, entry.id)) ?? {
          id: `virtual-${race.id}-${entry.id}`,
          raceId: race.id,
          eventEntryId: entry.id,
          finishPosition: null,
          statusCode: 'DNC' as RaceResultStatusCode,
          createdAt: race.createdAt,
          updatedAt: race.updatedAt,
        };
        const points = this.calculateRacePoints(raw, eventEntries.length, {
          breakdownAverage: numericAverages.get(entry.id),
        });

        return {
          ...raw,
          calculatedPoints: points,
          displayValue: raw.statusCode ?? formatPoints(points),
        };
      });

      return {
        eventEntryId: entry.id,
        divisionId: division.id,
        total: scores.reduce((sum, score) => sum + score.calculatedPoints, 0),
        scores,
        tieBreakVector: buildTieBreakVector(scores, eventEntries.length),
      };
    });

    const sorted = this.resolveSeriesTies(rows);
    return rankSorted(sorted);
  }

  calculateOverallStandings({
    divisions,
    eventEntries,
    races,
    results,
  }: OverallStandingInput) {
    const divisionStandings = divisions.flatMap((division) =>
      this.calculateDivisionStandings({ division, eventEntries, races, results }),
    );

    const rows = eventEntries.map((entry) => {
      const entryDivisionRows = divisionStandings.filter(
        (standing) => standing.eventEntryId === entry.id,
      );
      const divisionTotals = Object.fromEntries(
        entryDivisionRows.map((standing) => [standing.divisionId, standing.total]),
      );
      const allScores = entryDivisionRows.flatMap((standing) => standing.scores);

      return {
        eventEntryId: entry.id,
        total: Object.values(divisionTotals).reduce((sum, points) => sum + points, 0),
        divisionTotals,
        tieBreakVector: buildTieBreakVector(allScores, eventEntries.length),
      };
    });

    const sorted = this.resolveSeriesTies(rows);
    return rankSorted(sorted);
  }

  resolveSeriesTies<T extends { total: number; tieBreakVector: number[] }>(
    standings: T[],
  ) {
    return [...standings].sort((a, b) => {
      if (a.total !== b.total) {
        return a.total - b.total;
      }

      return compareTieVectors(a.tieBreakVector, b.tieBreakVector);
    });
  }
}

export const scoringEngines: Record<string, ScoringEngine> = {
  ICSA_FLEET: new IcsaFleetScoringEngine(),
};

export const defaultScoringEngine = scoringEngines.ICSA_FLEET;
