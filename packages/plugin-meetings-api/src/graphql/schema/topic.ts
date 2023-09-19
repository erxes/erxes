const params = `
  title: String
  description: String
  ownerId: String
  meetingId: String
`;
export const mutations = `
  meetingTopicAdd(${params}): Topic
  meetingTopicEdit(_id: String!,${params}): Topic
  `;
