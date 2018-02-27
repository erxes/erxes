export const types = `
type FieldsGroup {
    _id: String!
    name: String
    contentType: String
    order: Int
    description: String
    isVisible: Boolean
    isDefinedByErxes: Boolean
    Fields: [Field]
    lastUpdatedUserId: String
    lastUpdatedBy: User
  }
`;

const commonFields = `
  name: String
  contentType: String
  order: Int
  description: String
  visible: Boolean
  lastUpdatedUserId: String
`;

export const queries = `
  fieldsGroups(contentType: String): [FieldsGroup]
`;

export const mutations = `
  fieldsGroupsAdd(${commonFields}): FieldsGroup
  fieldsGroupsEdit(_id: String!, ${commonFields}): FieldsGroup
  fieldsGroupsRemove(_id: String!): String
  fieldsGroupsUpdateVisible
  (_id: String, isVisible: Boolean, lastUpdatedUserId: String) : FieldsGroup
`;
