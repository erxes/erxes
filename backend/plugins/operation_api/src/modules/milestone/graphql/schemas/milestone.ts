import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Milestone {
    _id: String
    name: String
    description: String
    targetDate: Date
    projectId: String
  }

  type MilestoneListResponse {
    list: [Milestone],
    pageInfo: PageInfo
    totalCount: Int,
  }

  type MilestoneProgress {
    _id: String
    name: String
    targetDate: Date
    totalScope: Int
    totalStartedScope: Int
    totalCompletedScope: Int
  }
`;

const queryParams = `
    projectId: String!
    searchValue: String
    ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
    getMilestone(_id: String!): Milestone
    milestones(${queryParams}): MilestoneListResponse
    milestoneProgress(projectId: String!): [MilestoneProgress]
`;

const mutationParams = `
    name: String!
    description: String
    targetDate: Date
    projectId: String!
`;

export const mutations = `
    createMilestone(${mutationParams}): Milestone
    updateMilestone(_id: String! ${mutationParams}): Milestone
    removeMilestone(_id: String!): Milestone
`;
