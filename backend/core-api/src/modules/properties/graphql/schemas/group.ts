import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type FieldGroup {
        _id: String!
        name: String!
        code: String!
        description: String!
        contentType: String!
        order: Float
        logics: JSON
        createdAt: Date!
        updatedAt: Date!
    }

    type FieldGroupListResponse {
        list: [FieldGroup]
        pageInfo: PageInfo
        totalCount: Int!
    }

    input FieldGroupParams {
        contentType: String!
        contentTypeId: String
        codes: [String]

        ${GQL_CURSOR_PARAM_DEFS}
    }
`;

export const queries = `
    fieldGroups(params: FieldGroupParams): FieldGroupListResponse
`;

const mutationParams = `
    name: String
    code: String
    description: String
    contentType: String
    logics: JSON
`;

export const mutations = `
    fieldGroupAdd(${mutationParams}): FieldGroup
    fieldGroupEdit(_id: String!, order: Float, ${mutationParams}): FieldGroup
    fieldGroupRemove(_id: String!): FieldGroup
`;
