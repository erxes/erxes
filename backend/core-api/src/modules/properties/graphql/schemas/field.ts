import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
    type Field {
        _id: String!
        name: String
        code: String
        type: String
        order: Float
        isVisible: Boolean
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
        isVisible: Boolean
        searchable: Boolean
        groupIds: [String]
        isVisibleToCreate: Boolean

        ${GQL_CURSOR_PARAM_DEFS}
    }

    input FieldInput {  
        name: String
        code: String
        groupId: String
        contentType: String
        contentTypeId: String
        
        type: String
        order: Float
        isVisible: Boolean

        validations: JSON
        logics: JSON
    }
`;

export const queries = `
    fields(params: FieldsParams): FieldListResponse
    fieldDetail(_id: String!): Field
`;

export const mutations = `
    fieldAdd(doc: FieldInput!): Field
    fieldEdit(_id: String!, doc: FieldInput!): Field
    fieldRemove(_id: String!): Field
`;
