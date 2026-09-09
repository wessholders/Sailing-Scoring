import type { RaceResult, RaceResultStatusCode } from '../domain';

const statuses = new Set<RaceResultStatusCode>([
  'DNC',
  'DNS',
  'OCS',
  'DNF',
  'DSQ',
  'BKD',
  'BYE',
]);

export function validateRaceResults(results: RaceResult[], expectedEntryIds: string[]) {
  const warnings: string[] = [];
  const finishPositions = new Map<number, string[]>();
  const resultEntryIds = new Set(results.map((result) => result.eventEntryId));

  expectedEntryIds.forEach((entryId) => {
    if (!resultEntryIds.has(entryId)) {
      warnings.push(`Missing result for ${entryId}`);
    }
  });

  results.forEach((result) => {
    if (result.statusCode && !statuses.has(result.statusCode)) {
      warnings.push(`Unsupported status ${result.statusCode} for ${result.eventEntryId}`);
    }

    if (result.statusCode && result.finishPosition !== null) {
      warnings.push(`${result.eventEntryId} cannot have both finish and status`);
    }

    if (!result.statusCode && result.finishPosition === null) {
      warnings.push(`${result.eventEntryId} needs a finish or status`);
    }

    if (typeof result.finishPosition === 'number') {
      const entries = finishPositions.get(result.finishPosition) ?? [];
      finishPositions.set(result.finishPosition, [...entries, result.eventEntryId]);
    }
  });

  finishPositions.forEach((entries, finishPosition) => {
    if (entries.length > 1) {
      warnings.push(`Finish ${finishPosition} is duplicated`);
    }
  });

  return warnings;
}
