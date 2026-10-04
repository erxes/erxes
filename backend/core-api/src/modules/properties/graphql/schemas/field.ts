import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `

    type FieldOption {
        label: String
        value: String
        deprecated: Boolean
        coordinates: JSON
    }

    input FieldOptionInput {
        label: String
        value: String
        deprecated: Boolean
        coordinates: JSON
    }

    # Set on featured fields: a plugin feature owns the field and its values.
    type FieldOwner {
        plugin: String
        module: String
        refId: String
        key: String
        status: String
    }

    type Field {
        _id: String
        name: String
        code: String
        type: String
        order: Float
        groupId: String
        options: [FieldOption]
        validations: JSON
        logics: JSON
        configs: JSON
        icon: String
        isVisible: Boolean
        isVisibleToCreate: Boolean
        isRequired: Boolean
        isVisibleInCard: Boolean
        owner: FieldOwner
        archivedAt: Date
        createdAt: Date
        updatedAt: Date
    }

    # Whether fields can be removed, or only archived.
    type FieldUsage {
        dependents: [String!]!
        # null when it could not be checked
        hasValues: Boolean
        removable: Boolean!
    }

    type FieldUsageRecord {
        _id: String!
        label: String!
    }

    type FieldOptionUsage {
        value: String!
        count: Int!
    }

    # The first records holding a value; known is false when it could not be checked.
    type FieldValueUsage {
        known: Boolean!
        samples: [FieldUsageRecord!]!
        dependents: [String!]!
    }

    # May scan every record, so it is asked for apart from the samples.
    type FieldValueCounts {
        known: Boolean!
        count: Int!
        capped: Boolean!
        # null when the per-option tally gave up
        byOption: [FieldOptionUsage!]
    }

    # Rules and segments that still name one option.
    type FieldOptionDependents {
        logics: [String!]!
        segments: [String!]!
    }

    type FieldListResponse {
        list: [Field]
        pageInfo: PageInfo
        totalCount: Int
    }

    input FieldsParams {
        contentType: String
        contentTypeId: String
        groupId: String
        archived: Boolean

        ${GQL_CURSOR_PARAM_DEFS}
    }

    input CpFieldsParams {
        contentType: String
        contentTypeId: String
        groupId: String

        ${GQL_CURSOR_PARAM_DEFS}
    }
`;

export const queries = `
    fields(params: FieldsParams): FieldListResponse
    fieldDetail(_id: String!): Field
    fieldUsage(fieldIds: [String!], groupId: String, contentType: String!): FieldUsage!
    fieldValueUsage(_id: String!, value: String): FieldValueUsage!
    fieldValueCounts(_id: String!, value: String): FieldValueCounts!
    fieldOptionDependents(_id: String!, value: String!): FieldOptionDependents!

    cpFields(params: CpFieldsParams): [Field]
    cpFieldDetail(_id: String!): Field
`;

const mutationParams = `
    name: String
    code: String
    groupId: String
    contentType: String
    contentTypeId: String
    
    type: String
    options: [FieldOptionInput]
    validations: JSON
    logics: JSON
    configs: JSON
    icon: String
    isVisible: Boolean
    isVisibleToCreate: Boolean
    isRequired: Boolean
    isVisibleInCard: Boolean
`;

export const mutations = `
    fieldAdd(${mutationParams}): Field
    fieldEdit(_id: String!, order: Float, ${mutationParams}): Field
    fieldRemove(_id: String!): Field
    fieldsRemove(_ids: [String!]!): JSON
    fieldsArchive(_ids: [String!]!): JSON
    fieldRestore(_id: String!): Field
`;
