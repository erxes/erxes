import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type Field {
        _id: String!
        name: String
        code: String
        type: String
        order: Float
        validations: JSON
        logics: JSON
        createdAt: Date
        updatedAt: Date
    }

    type FieldListResponse {
        list: [Field]
        pageInfo: PageInfo
        totalCount: Int
    }

    input FieldsParams {
        contentType: String!
        contentTypeId: String
        groupIds: [String]

        ${GQL_CURSOR_PARAM_DEFS}
    }
`;

export const queries = `
    fields(params: FieldsParams): FieldListResponse
    fieldDetail(_id: String!): Field
`;

const mutationParams = `
    name: String
    code: String
    groupId: String
    contentType: String
    contentTypeId: String
    
    type: String

    validations: JSON
    logics: JSON
`;

export const mutations = `
    fieldAdd(${mutationParams}): Field
    fieldEdit(_id: String!, order: Float, ${mutationParams}): Field
    fieldRemove(_id: String!): Field
`;
