import { commonTypes } from './common';

export const types = `
  type GrowthHack {
    _id: String!
    hackStages: [String]
    reach: Int
    impact: Int
    confidence: Int
    ease: Int
    voteCount: Int
    votedUsers: [User]
    isVoted: Boolean
    formId: String
    scoringType: String
    formSubmissions: JSON
    formFields: [Field]
    ${commonTypes}
  }
`;

const commonQueryFields = `
  pipelineId: String
  initialStageId: String
  stageId: String
  skip: Int
  limit: Int
  search: String
  assignedUserIds: [String]
  nextDay: String
  nextWeek: String
  nextMonth: String
  noCloseDate: String
  overdue: String
  hackStage: [String]
  priority: [String]
`;

export const queries = `
  growthHackDetail(_id: String!): GrowthHack
  growthHacks(
    ${commonQueryFields}
    sortField: String
    sortDirection: Int
  ): [GrowthHack]

  growthHacksTotalCount(
    ${commonQueryFields}
  ): Int

  growthHacksPriorityMatrix(
    pipelineId: String
    search: String
    assignedUserIds: [String]
    nextDay: String
    nextWeek: String
    nextMonth: String
    noCloseDate: String
    overdue: String
  ): JSON
`;

const commonParams = `
  name: String,
  stageId: String,
  assignedUserIds: [String],
  attachments: [AttachmentInput],
  closeDate: Date,
  description: String,
  hackStages: [String],
  priority: String,
  reach: Int,
  impact: Int,
  confidence: Int,
  ease: Int,
`;

export const mutations = `
  growthHacksAdd(${commonParams}): GrowthHack
  growthHacksEdit(_id: String!, ${commonParams}): GrowthHack
  growthHacksChange( _id: String!, destinationStageId: String!): GrowthHack
  growthHacksUpdateOrder(stageId: String!, orders: [OrderItem]): [GrowthHack]
  growthHacksRemove(_id: String!): GrowthHack
  growthHacksWatch(_id: String, isAdd: Boolean): GrowthHack
  growthHacksVote(_id: String!, isVote: Boolean): GrowthHack
`;
