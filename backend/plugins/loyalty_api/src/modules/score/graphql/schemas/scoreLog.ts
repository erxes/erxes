import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

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

  type ScoreLogList {
    list: [ScoreLog]
    total: Int
  }

  type ScoreLogListResponse {
    list: [ScoreLogItem]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String,
  campaignId: String,
  ownerType: String,
  ownerId: String,
  status: String,
  action: String,
  fromDate: String,
  toDate: String,
`;

export const queries = `
  scoreLogs(${queryParams} ${GQL_CURSOR_PARAM_DEFS}): ScoreLogListResponse
  scoreLogList(${queryParams}): ScoreLogList
  scoreLogStatistics(${queryParams}): JSON
`;

const mutationParams = `
  ownerType: String!
  ownerId: String!
  campaignId: String
  targetId: String
  action: String!
  change: Float!
  description: String
  serviceName: String
`;

export const mutations = `
  changeScore(${mutationParams}): ScoreLogItem
`;
