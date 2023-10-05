const params = `
  pinnedUserIds: [String]
`;
export const mutations = `
  meetingPinnedUserUpdate(${params}): PinnedUsers
  `;

export const queries = `
  meetingPinnedUsers: PinnedUsers
`;
