const fieldsGroups = `
  query fieldsGroups($contentType: String!) {
    fieldsGroups(contentType: $contentType) {
      _id
      name
      description
      order
      isVisible
      lastUpdatedUser {
        details {
          fullName
        }
      }
      isDefinedByErxes
      fields {
        _id
        contentType
        type
        text
        isVisible
        validation
        order
        options
        groupId
        description
        isDefinedByErxes
        lastUpdatedUser {
          details {
            fullName
          }
        }
      }
    }
  }
`;

export default {
  fieldsGroups,
};
