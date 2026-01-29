export const types = `
  type ScoreLogItem {
    _id: String
    ownerId: String
    ownerType: String

    change: Float
    action: String
    description: String

    campaignId: String
    campaign: ScoreCampaign

    targetId: String
    target: JSON

    serviceName: String
    createdBy: String
    createdAt: Date
  }

  type ScoreLog {
    ownerId: String
    ownerType: String

    owner: JSON
    logs: [ScoreLogItem]
    totalScore: Float
  }
`;
export const queries = `
  getScoreLogs(
    ownerType: String
    ownerId: String
    campaignId: String
    action: String
    limit: Int
    cursor: String
  ): [ScoreLogItem]

  getScoreLogStatistics(
    ownerType: String
    ownerId: String
    campaignId: String
    action: String
    fromDate: String
    toDate: String
  ): JSON
`;
export const mutations = `
  changeScore(
    ownerType: String!
    ownerId: String!
    campaignId: String
    targetId: String
    action: String!
    change: Float!
    description: String
    serviceName: String
  ): ScoreLogItem
`;
