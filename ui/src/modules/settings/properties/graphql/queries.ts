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

const fields = `
  query fields($contentType: String!, $contentTypeId: String, $isVisible: Boolean) {
    fields(contentType: $contentType, contentTypeId: $contentTypeId, isVisible: $isVisible) {
      _id
      type
      validation
      text
      description
      options
      isRequired
      order
      associatedFieldId
      associatedField {
        _id
        text
      }
    }
  }
`;

export default {
  fieldsGroups,
  fields
};
