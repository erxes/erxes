const fields = `
query fieldsByGroup($visible: Boolean, $contentType: String!) {
  fieldsByGroup(visible: $visible, contentType: $contentType) {
    _id
    name
    fields
  }
  }
`;

const fieldsgroups = `
  query fieldsgroups($contentType: String!) {
    fieldsgroups(contentType: $contentType) {
      _id
      name
      getFields {
        _id
        contentType
        contentTypeId
        type
        validation
        text
        description
        options
        isRequired
        order
      }
    }
  }
`;

export default {
  fields,
  fieldsgroups
};
