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

    input FieldGroupInput {
        name: String
        code: String
        description: String
        contentType: String
        contentTypeId: String
        order: Float
        logics: JSON
    }
`;

export const queries = `
    fieldGroups(params: FieldGroupParams): FieldGroupListResponse
`;

export const mutations = `
    fieldGroupAdd(doc: FieldGroupInput!): FieldGroup
    fieldGroupEdit(_id: String!, doc: FieldGroupInput!): FieldGroup
    fieldGroupRemove(_id: String!): FieldGroup
`;
