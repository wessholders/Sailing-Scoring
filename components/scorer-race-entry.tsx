'use client';

import { useMemo, useState } from 'react';
import type { Division, EventEntry, Race, RaceResult, RaceResultStatusCode } from '@/lib/domain';
import { defaultScoringEngine } from '@/lib/scoring';
import { validateRaceResults } from '@/lib/validation/scoring';

const statusCodes: RaceResultStatusCode[] = ['DNC', 'DNS', 'OCS', 'DNF', 'DSQ', 'BKD', 'BYE'];

type ResultRow = {
  eventEntryId: string;
  finishPosition: string;
  statusCode: RaceResultStatusCode | '';
};

type ScorerRaceEntryProps = {
  division: Division;
  entries: EventEntry[];
  races: Race[];
  selectedRace: Race;
  existingResults: RaceResult[];
};

export function ScorerRaceEntry({
  division,
  entries,
  races,
  selectedRace,
  existingResults,
}: ScorerRaceEntryProps) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [rows, setRows] = useState<ResultRow[]>(() =>
    entries.map((entry) => {
      const existing = existingResults.find(
        (result) => result.raceId === selectedRace.id && result.eventEntryId === entry.id,
      );

      return {
        eventEntryId: entry.id,
        finishPosition: existing?.finishPosition?.toString() ?? '',
        statusCode: existing?.statusCode ?? '',
      };
    }),
  );

  const raceResults = useMemo<RaceResult[]>(
    () =>
      rows.map((row) => ({
        id: `draft-${selectedRace.id}-${row.eventEntryId}`,
        raceId: selectedRace.id,
        eventEntryId: row.eventEntryId,
        finishPosition: row.finishPosition ? Number(row.finishPosition) : null,
        statusCode: row.statusCode || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    [rows, selectedRace.id],
  );

  const warnings = validateRaceResults(
    raceResults,
    entries.map((entry) => entry.id),
  );
  const previewStandings = defaultScoringEngine.calculateDivisionStandings({
    division,
    eventEntries: entries,
    races: [
      ...races.filter((race) => race.id !== selectedRace.id),
      { ...selectedRace, status: 'COMPLETED', countsTowardStandings: true },
    ],
    results: [...existingResults.filter((result) => result.raceId !== selectedRace.id), ...raceResults],
  });

  function assignNextFinish(eventEntryId: string) {
    setRows((currentRows) => {
      const usedFinishes = currentRows
        .map((row) => Number(row.finishPosition))
        .filter((value) => Number.isInteger(value) && value > 0);
      const nextFinish = usedFinishes.length === 0 ? 1 : Math.max(...usedFinishes) + 1;

      return currentRows.map((row) =>
        row.eventEntryId === eventEntryId
          ? { ...row, finishPosition: nextFinish.toString(), statusCode: '' }
          : row,
      );
    });
  }

  function updateRow(eventEntryId: string, patch: Partial<ResultRow>) {
    setRows((currentRows) =>
      currentRows.map((row) => (row.eventEntryId === eventEntryId ? { ...row, ...patch } : row)),
    );
    setSavedAt(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-[#d7ded2] bg-white">
        <div className="border-b border-[#d7ded2] px-5 py-4">
          <h2 className="text-xl font-semibold">{division.name} Race {selectedRace.raceNumber}</h2>
          <p className="text-sm text-[#66756d]">
            Click boats in finish order or type positions directly. Status codes replace finishes.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[#eef2eb] text-xs uppercase tracking-[0.08em] text-[#66756d]">
              <tr>
                <th className="px-5 py-3">Entry</th>
                <th className="px-5 py-3">Finish</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Quick Entry</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const entry = entries.find((candidate) => candidate.id === row.eventEntryId);
                return (
                  <tr className="border-t border-[#edf0ea]" key={row.eventEntryId}>
                    <td className="px-5 py-3 font-semibold">{entry?.entryName}</td>
                    <td className="px-5 py-3">
                      <input
                        aria-label={`Finish position for ${entry?.entryName}`}
                        className="w-24 rounded-md border border-[#cbd6cd] px-3 py-2 outline-none focus:border-[#193f3a]"
                        inputMode="numeric"
                        min={1}
                        onChange={(event) =>
                          updateRow(row.eventEntryId, {
                            finishPosition: event.target.value,
                            statusCode: '',
                          })
                        }
                        type="number"
                        value={row.finishPosition}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        aria-label={`Status code for ${entry?.entryName}`}
                        className="w-28 rounded-md border border-[#cbd6cd] bg-white px-3 py-2 outline-none focus:border-[#193f3a]"
                        onChange={(event) =>
                          updateRow(row.eventEntryId, {
                            statusCode: event.target.value as RaceResultStatusCode | '',
                            finishPosition: '',
                          })
                        }
                        value={row.statusCode}
                      >
                        <option value="">Finish</option>
                        {statusCodes.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        className="rounded-md border border-[#cbd6cd] px-3 py-2 font-semibold text-[#405850]"
                        onClick={() => assignNextFinish(row.eventEntryId)}
                        type="button"
                      >
                        Mark Next
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
          <h2 className="text-lg font-semibold">Validation</h2>
          {warnings.length === 0 ? (
            <p className="mt-3 rounded-md bg-[#eaf5ed] px-3 py-2 text-sm font-semibold text-[#25633b]">
              Race is complete and internally consistent.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-[#8a321f]">
              {warnings.slice(0, 6).map((warning) => (
                <li className="rounded-md bg-[#fff4ef] px-3 py-2" key={warning}>
                  {warning}
                </li>
              ))}
            </ul>
          )}
          <button
            className="mt-4 w-full rounded-md bg-[#193f3a] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9aaaa4]"
            disabled={warnings.length > 0}
            onClick={() => setSavedAt(new Date().toLocaleTimeString())}
            type="button"
          >
            Save Race
          </button>
          {savedAt && <p className="mt-3 text-sm text-[#66756d]">Draft saved at {savedAt}. Standings recalculated.</p>}
        </section>

        <section className="rounded-lg border border-[#d7ded2] bg-white p-5">
          <h2 className="text-lg font-semibold">Updated Standings</h2>
          <div className="mt-4 space-y-2">
            {previewStandings.slice(0, 6).map((standing) => {
              const entry = entries.find((candidate) => candidate.id === standing.eventEntryId);
              return (
                <div className="grid grid-cols-[44px_1fr_64px] rounded-md bg-[#f7f8f4] px-3 py-2 text-sm" key={standing.eventEntryId}>
                  <span className="font-semibold">{standing.tied ? `T-${standing.place}` : standing.place}</span>
                  <span>{entry?.entryName}</span>
                  <span className="text-right font-semibold">{standing.total}</span>
                </div>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}
