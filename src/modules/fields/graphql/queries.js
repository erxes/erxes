const fields = `
  query fields($contentType: String!, $contentTypeId: String) {
    fields(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
      type
      validation
      text
      description
      options
      isRequired
      order
    }
  }
`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!) {
    fieldsCombinedByContentType(contentType: $contentType)
  }
`;

const fieldsDefaultColumnsConfig = `
  query fieldsDefaultColumnsConfig($contentType: String!) {
    fieldsDefaultColumnsConfig(contentType: $contentType) {
      name
      label
      order
    }
  }
`;

export default {
  fields,
  fieldsCombinedByContentType,
  fieldsDefaultColumnsConfig
};
