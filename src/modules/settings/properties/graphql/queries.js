const fieldsGroups = `
  query fieldsGroups($contentType: String!) {
    fieldsGroups(contentType: $contentType) {
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
  fieldsGroups
};
