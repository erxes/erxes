import { commonDragParams, commonTypes } from './common';

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
  closeDateType: String
  hackStage: [String]
  priority: [String]
  labelIds: [String]
  userIds: [String]
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
    closeDateType: String
  ): JSON

  archivedGrowthHacks(pipelineId: String!, search: String, page: Int, perPage: Int): [GrowthHack]
  archivedGrowthHacksCount(pipelineId: String!, search: String): Int
`;

const commonParams = `
  proccessId: String,
  aboveItemId: String,
  name: String,
  stageId: String,
  assignedUserIds: [String],
  attachments: [AttachmentInput],
  closeDate: Date,
  status: String,
  description: String,
  hackStages: [String],
  priority: String,
  reach: Int,
  impact: Int,
  confidence: Int,
  ease: Int,
`;

export const mutations = `
  growthHacksAdd(${commonParams}, labelIds: [String]): GrowthHack
  growthHacksEdit(_id: String!, ${commonParams}): GrowthHack
  growthHacksChange(${commonDragParams}): GrowthHack
  growthHacksRemove(_id: String!): GrowthHack
  growthHacksWatch(_id: String, isAdd: Boolean): GrowthHack
  growthHacksVote(_id: String!, isVote: Boolean): GrowthHack
  growthHacksCopy(_id: String!, proccessId: String): GrowthHack
  growthHacksArchive(stageId: String!, proccessId: String): String
`;
