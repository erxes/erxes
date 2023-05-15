const forms = `
  query forms {
    forms {
      _id
      title
    }
  }
`;

const relations = `
query FieldsGetRelations($contentType: String!, $isVisibleToCreate: Boolean) {
  fieldsGetRelations(contentType: $contentType, isVisibleToCreate: $isVisibleToCreate) {
    _id
    contentType
    name
    type
    text
    isVisibleToCreate
    relationType
  }
}
`;

export default {
  forms,
  relations
};
