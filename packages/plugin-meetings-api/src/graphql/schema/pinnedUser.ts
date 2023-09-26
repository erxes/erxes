const params = `
  pinnedUserIds: [String]
`;
export const mutations = `
  meetingPinnedUserAdd(${params}): PinnedUser
  meetingPinnedUserEdit(${params}): PinnedUser
  `;

export const queries = `
  meetingPinnedUsers: PinnedUser
`;
