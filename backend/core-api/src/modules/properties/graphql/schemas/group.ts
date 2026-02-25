import { GQL_CURSOR_PARAM_DEFS, GQL_OFFSET_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type FieldGroup {
        _id: String
        name: String
        code: String
        description: String
        contentType: String
        order: Float
        logics: JSON
        configs: JSON
        createdAt: Date!
        updatedAt: Date!
    }

    type FieldGroupListResponse {
        list: [FieldGroup]
        pageInfo: PageInfo
        totalCount: Int
    }

    input FieldGroupParams {
        contentType: String!
        codes: [String]

        ${GQL_CURSOR_PARAM_DEFS}
    }

    input CpFieldGroupParams {
        contentType: String!
        codes: [String]

        ${GQL_OFFSET_PARAM_DEFS}
    }
`;

export const queries = `
    fieldGroups(params: FieldGroupParams): FieldGroupListResponse
    cpFieldGroups(params: CpFieldGroupParams): [FieldGroup]
`;

const mutationParams = `
    name: String
    code: String
    description: String
    contentType: String
    logics: JSON
    configs: JSON
`;

export const mutations = `
    fieldGroupAdd(${mutationParams}): FieldGroup
    fieldGroupEdit(_id: String!, order: Float, ${mutationParams}): FieldGroup
    fieldGroupRemove(_id: String!): FieldGroup
`;
