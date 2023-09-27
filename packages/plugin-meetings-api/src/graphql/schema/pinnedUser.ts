const params = `
  pinnedUserIds: [String]
`;
export const mutations = `
  meetingPinnedUserAdd(${params}): PinnedUsers
  meetingPinnedUserEdit(${params}): PinnedUsers
  `;

export const queries = `
  meetingPinnedUsers: PinnedUsers
`;
