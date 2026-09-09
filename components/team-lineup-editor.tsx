'use client';

import { useMemo, useState } from 'react';

type DivisionOption = {
  id: string;
  name: string;
  code: string;
};

type SailorOption = {
  id: string;
  name: string;
  graduationYear: number;
};

type AssignmentDraft = {
  divisionId: string;
  role: 'SKIPPER' | 'CREW';
  sailorId: string;
  startRaceNumber: number;
  endRaceNumber?: number;
};

type LineupTeam = {
  entryId: string;
  entryName: string;
  teamName: string;
  sailors: SailorOption[];
  assignments: AssignmentDraft[];
};

type TeamLineupEditorProps = {
  divisions: DivisionOption[];
  teams: LineupTeam[];
};

export function TeamLineupEditor({ divisions, teams }: TeamLineupEditorProps) {
  const [activeEntryId, setActiveEntryId] = useState(teams[0]?.entryId ?? '');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [lineups, setLineups] = useState<Record<string, AssignmentDraft[]>>(() =>
    Object.fromEntries(teams.map((team) => [team.entryId, team.assignments])),
  );

  const activeTeam = teams.find((team) => team.entryId === activeEntryId) ?? teams[0];

  const heatRows = useMemo(() => {
    if (!activeTeam) {
      return [];
    }

    const activeLineup = lineups[activeTeam.entryId] ?? [];

    return divisions.flatMap((division) =>
      (['SKIPPER', 'CREW'] as const).map((role) => {
        const assignment =
          activeLineup.find((candidate) => candidate.divisionId === division.id && candidate.role === role) ??
          {
            divisionId: division.id,
            role,
            sailorId: activeTeam.sailors[0]?.id ?? '',
            startRaceNumber: 1,
          };

        return { division, assignment };
      }),
    );
  }, [activeTeam, divisions, lineups]);

  function updateAssignment(nextAssignment: AssignmentDraft) {
    if (!activeTeam) {
      return;
    }

    setSavedAt(null);
    setLineups((currentLineups) => {
      const existing = currentLineups[activeTeam.entryId] ?? [];
      const withoutCurrent = existing.filter(
        (assignment) =>
          assignment.divisionId !== nextAssignment.divisionId || assignment.role !== nextAssignment.role,
      );

      return {
        ...currentLineups,
        [activeTeam.entryId]: [...withoutCurrent, nextAssignment],
      };
    });
  }

  if (!activeTeam) {
    return null;
  }

  return (
    <section className="rounded-lg border border-[#d7ded2] bg-white">
      <div className="border-b border-[#d7ded2] px-5 py-4">
        <h2 className="text-xl font-semibold">Attending Team Lineups</h2>
        <p className="text-sm text-[#66756d]">
          Visiting team managers can declare who sailed each division and heat range before scores are finalized.
        </p>
      </div>

      <div className="grid gap-5 p-5">
        <div className="flex flex-wrap gap-2">
          {teams.map((team) => (
            <button
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                team.entryId === activeTeam.entryId
                  ? 'border-[#193f3a] bg-[#193f3a] text-white'
                  : 'border-[#cbd6cd] bg-white text-[#405850]'
              }`}
              key={team.entryId}
              onClick={() => {
                setActiveEntryId(team.entryId);
                setSavedAt(null);
              }}
              type="button"
            >
              {team.entryName}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[#eef2eb] text-xs uppercase tracking-[0.08em] text-[#66756d]">
              <tr>
                <th className="px-4 py-3">Division</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Sailor</th>
                <th className="px-4 py-3">Race Range</th>
              </tr>
            </thead>
            <tbody>
              {heatRows.map(({ division, assignment }) => (
                <tr className="border-t border-[#edf0ea]" key={`${division.id}-${assignment.role}`}>
                  <td className="px-4 py-3 font-semibold">{division.name}</td>
                  <td className="px-4 py-3">{assignment.role}</td>
                  <td className="px-4 py-3">
                    <select
                      className="w-full rounded-md border border-[#cbd6cd] bg-white px-3 py-2 outline-none focus:border-[#193f3a]"
                      onChange={(event) => updateAssignment({ ...assignment, sailorId: event.target.value })}
                      value={assignment.sailorId}
                    >
                      {activeTeam.sailors.map((sailor) => (
                        <option key={sailor.id} value={sailor.id}>
                          {sailor.name} &apos;{String(sailor.graduationYear).slice(2)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        aria-label={`${division.name} ${assignment.role} start race`}
                        className="w-20 rounded-md border border-[#cbd6cd] px-3 py-2 outline-none focus:border-[#193f3a]"
                        min={1}
                        onChange={(event) =>
                          updateAssignment({ ...assignment, startRaceNumber: Number(event.target.value) || 1 })
                        }
                        type="number"
                        value={assignment.startRaceNumber}
                      />
                      <span className="text-[#66756d]">to</span>
                      <input
                        aria-label={`${division.name} ${assignment.role} end race`}
                        className="w-20 rounded-md border border-[#cbd6cd] px-3 py-2 outline-none focus:border-[#193f3a]"
                        min={assignment.startRaceNumber}
                        onChange={(event) =>
                          updateAssignment({
                            ...assignment,
                            endRaceNumber: event.target.value ? Number(event.target.value) : undefined,
                          })
                        }
                        placeholder="end"
                        type="number"
                        value={assignment.endRaceNumber ?? ''}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-md bg-[#193f3a] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setSavedAt(new Date().toLocaleTimeString())}
            type="button"
          >
            Save Lineup
          </button>
          {savedAt && <p className="text-sm text-[#66756d]">{activeTeam.entryName} lineup saved at {savedAt}.</p>}
        </div>
      </div>
    </section>
  );
}
