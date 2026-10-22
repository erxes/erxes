import type { IUser } from '../types/TeamMembers';

export const memberOptions = (
  currentUser: IUser | null,
  selected: IUser[],
  users: IUser[],
  inactiveIds: string[],
  search: string,
): IUser[] => {
  const candidates = [
    ...selected,
    ...(currentUser ? [currentUser] : []),
    ...users,
  ];
  const selectedIds = new Set(selected.map(({ _id }) => _id));
  const query = search.trim().toLowerCase();
  const seen = new Set<string>();
  return candidates.filter((member) => {
    if (seen.has(member._id)) return false;
    seen.add(member._id);
    if (
      !selectedIds.has(member._id) &&
      (member.isActive === false || inactiveIds.includes(member._id))
    )
      return false;
    const { details, email, username } = member;
    return (
      !query ||
      [
        details?.fullName,
        `${details?.firstName || ''} ${details?.lastName || ''}`,
        email,
        username,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  });
};
