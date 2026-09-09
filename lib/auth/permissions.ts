import { eventUserRoles, userTeamRoles, users } from '../seed-data';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  return users[0];
}

export async function canManageEvent(eventId: string) {
  const user = await getCurrentUser();
  return (
    user.id === 'user-admin' ||
    eventUserRoles.some(
      (role) =>
        role.userId === user.id &&
        role.eventId === eventId &&
        (role.role === 'SCORER' || role.role === 'EVENT_ADMIN'),
    )
  );
}

export async function canManageTeam(teamId: string) {
  const user = await getCurrentUser();
  return (
    user.id === 'user-admin' ||
    userTeamRoles.some(
      (role) =>
        role.userId === user.id &&
        role.teamId === teamId &&
        (role.role === 'TEAM_MANAGER' || role.role === 'TEAM_ADMIN'),
    )
  );
}
