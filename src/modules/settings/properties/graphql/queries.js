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
    }
  }
`;

export default {
  fields,
  fieldsgroups
};
