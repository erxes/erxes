export const types = `
type FieldsGroup {
    _id: String!
    name: String
    contentType: String
    order: Int
    description: String
    visible: Boolean
    isDefinedByErxes: Boolean
    getFields: [Field]
    lastUpdatedBy: User
  }
`;

const commonFields = `
  name: String
  contentType: String
  order: Int
  description: String
  visible: Boolean
  lastUpdatedBy: String
`;

export const queries = `
  fieldsgroups(contentType: String): [FieldsGroup]
`;

export const mutations = `
  fieldsGroupsAdd(${commonFields}): FieldsGroup
  fieldsGroupsEdit(_id: String!, ${commonFields}): FieldsGroup
  fieldsGroupsRemove(_id: String!): String
  fieldsGroupsUpdateOrder(_id: String!, order: Int) : FieldsGroup
  fieldsGroupsUpdateVisible(_id: String, visible: Boolean, lastUpdatedBy: String) : FieldsGroup
`;
