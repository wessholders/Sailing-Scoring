import { headers } from 'next/headers';
import { eventUserRoles, userTeamRoles, users } from '../seed-data';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  const headerList = await headers();
  const id = headerList.get('oai-authenticated-user-id');
  const email = headerList.get('oai-authenticated-user-email');
  const encodedName = headerList.get('oai-authenticated-user-full-name');
  const nameEncoding = headerList.get('oai-authenticated-user-full-name-encoding');

  if (id && email) {
    return {
      id,
      email,
      name:
        encodedName && nameEncoding === 'percent-encoded-utf-8'
          ? decodeURIComponent(encodedName)
          : email,
    };
  }

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
      (role) => role.userId === user.id && role.teamId === teamId && role.role === 'TEAM_MANAGER',
    )
  );
}
