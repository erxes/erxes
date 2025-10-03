import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type Cycle {
        _id: String
        name: String
        description: String
        startDate: Date
        endDate: Date
        teamId: String
        isCompleted: Boolean
        isActive: Boolean
        statistics: JSON
        donePercent: Int
        unFinishedTasks: [String]
    }

    type CycleListResponse {
        list: [Cycle],
        pageInfo: PageInfo
        totalCount: Int,
    }

    input CycleInput {
        _id: String
        name: String
        description: String
        startDate: Date
        endDate: Date
        teamId: String
    }
`;
export const queries = `
    getCycle(_id: String): Cycle
    getCycles(teamId: String, ${GQL_CURSOR_PARAM_DEFS}): CycleListResponse
    getCyclesActive(teamId: String,taskId: String, ${GQL_CURSOR_PARAM_DEFS}): CycleListResponse
    getCycleProgress(_id: String!, assigneeId: String): JSON
    getCycleProgressChart(_id: String!, assigneeId: String): JSON
    getCycleProgressByMember(_id: String!, assigneeId: String): JSON
    getCycleProgressByProject(_id: String!, assigneeId: String): JSON
`;

export const mutations = `
    createCycle(input: CycleInput): Cycle
    updateCycle(input: CycleInput): Cycle
    removeCycle(_id: String): JSON
`;
