const fieldsgroups = `
  query fieldsgroups($contentType: String!) {
    fieldsgroups(contentType: $contentType) {
      _id
      name
      description
      order
      visible
      lastUpdatedBy {
        details {
          fullName
        }
      }
      isDefinedByErxes
      getFields {
        _id
        contentType
        type
        text
        visible
        validation
        order
        options
        groupId
        description
        isDefinedByErxes
        lastUpdatedBy {
          details {
            fullName
          }
        }
      }
    }
  }
`;

export default {
  fieldsgroups
};
