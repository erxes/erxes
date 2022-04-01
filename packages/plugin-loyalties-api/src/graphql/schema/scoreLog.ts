export const types = `
  type ScoreLog {
    ownerId: String
    ownerType: String
    changeScore: Float
    description: String
    createdBy: String
    createdAt: Date

    owner: JSON
  }
`;

export const queries = `
  scoreLogs(ownerType: String, ownerId: String, searchValue: String): [ScoreLog]
`;
