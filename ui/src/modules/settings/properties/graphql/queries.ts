const genericFields = `
  _id
  description
  order
  isVisible
  isVisibleInDetail
  contentType
  isDefinedByErxes
`;

const commonFields = `
  type
  text
  field

  canHide
  validation
  options
  groupId

  ${genericFields}

  lastUpdatedUser {
    details {
      fullName
    }
  }
`;

const commonFieldsGroups = `
  name
  ${genericFields}

  lastUpdatedUser {
    details {
      fullName
    }
  }
  fields  {
    ${commonFields}
  }
}
`;

const fieldsGroups = `
  query fieldsGroups($contentType: String!) {
    fieldsGroups(contentType: $contentType) {
      ${commonFieldsGroups}
  }
`;

const getSystemFieldsGroup = `
  query getSystemFieldsGroup($contentType: String!) {
    getSystemFieldsGroup(contentType: $contentType) {
      ${commonFieldsGroups}
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

const inboxFields = `
  query fieldsInbox {
    fieldsInbox {
      customer { ${commonFields} }
      device { ${commonFields} }
      conversation { ${commonFields} }
    }
  }
`;

export default {
  fieldsGroups,
  fields,
  getSystemFieldsGroup,
  inboxFields
};
