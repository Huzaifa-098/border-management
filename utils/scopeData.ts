import { AdminUser, RegisteredUser, Role, UserEntry } from '../types';

type CurrentUser = RegisteredUser | AdminUser | null;

export function getScopedEntries(
  entries: UserEntry[],
  users: RegisteredUser[],
  currentRole: Role,
  currentUser: CurrentUser,
  cityFilter?: string,
  admins?: AdminUser[]
): UserEntry[] {
  let scoped = entries;

  if (currentRole === Role.USER && currentUser) {
    scoped = scoped.filter(e => e.userId === currentUser.id);
  } else if (currentRole === Role.BORDER_OFFICER && currentUser) {
    scoped = scoped.filter(e => e.createdByOfficerId === currentUser.id);
  } else if (currentRole === Role.CITY_ADMIN && currentUser) {
    const adminCity = (currentUser as AdminUser).assignedCity?.toLowerCase().trim();
    scoped = scoped.filter(entry => {
      const entryUser = users.find(u => u.id === entry.userId);
      const isCreatedByMe = entryUser?.createdByAdminId === currentUser.id;
      const isInMyJurisdiction =
        !!adminCity &&
        (entry.originCity.toLowerCase().trim() === adminCity ||
          (entry.assignedCity && entry.assignedCity.toLowerCase().trim() === adminCity));
      return isCreatedByMe || isInMyJurisdiction;
    });
  }

  if (cityFilter && cityFilter !== 'ALL') {
    const targetCity = cityFilter.toLowerCase().trim();
    scoped = scoped.filter(entry => {
      const isCityMatch = entry.originCity.toLowerCase().trim() === targetCity;
      let isCreatorMatch = false;
      const entryUser = users.find(u => u.id === entry.userId);
      if (entryUser?.createdByAdminId && admins) {
        const creatorAdmin = admins.find(a => a.id === entryUser.createdByAdminId);
        if (creatorAdmin?.assignedCity?.toLowerCase().trim() === targetCity) {
          isCreatorMatch = true;
        }
      }
      return isCityMatch || isCreatorMatch;
    });
  }

  return scoped;
}

export function getScopedUsers(
  users: RegisteredUser[],
  currentRole: Role,
  currentUser: CurrentUser
): RegisteredUser[] {
  if (currentRole === Role.CITY_ADMIN && currentUser) {
    return users.filter(u => u.createdByAdminId === currentUser.id);
  }
  if (currentRole === Role.USER && currentUser) {
    return users.filter(u => u.id === currentUser.id);
  }
  return users;
}
