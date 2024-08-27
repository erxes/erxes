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

const formsGetContentTypes = `
  query FormsGetContentTypes {
    formsGetContentTypes {
      title
      description
      contentType
      icon
    }
  }
`;

export default {
  forms,
  relations,
  formsGetContentTypes
};
