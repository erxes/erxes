const commonFields = `
  _id
  contentType
  type
  text
  field
  isVisible
  isVisibleInDetail
  canHide
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
`;

const field = `
  {
    ${commonFields}
  }
`;

const commonFieldsGroups = `
      _id
      name
      description
      order
      isVisible
      isVisibleInDetail
      contentType
      lastUpdatedUser {
        details {
          fullName
        }
      }
      isDefinedByErxes
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
      customer ${field}
      device ${field}
      conversation ${field}
    }
  }
`;

export default {
  fieldsGroups,
  fields,
  getSystemFieldsGroup,
  inboxFields
};
