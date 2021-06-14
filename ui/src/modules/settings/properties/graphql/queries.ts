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
  boardsPipelines {
    boardId
    pipelineIds
  }
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
  query fieldsGroups($contentType: String!, $boardId: String, $pipelineId: String) {
    fieldsGroups(contentType: $contentType, boardId: $boardId, pipelineId: $pipelineId) {
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
      isDefinedByErxes
      order
      associatedFieldId
      logicAction
      column
      associatedField {
        _id
        text
        contentType
      }
      logics {
        fieldId
        logicOperator
        logicValue
      }
      groupName
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

const fieldsItemTyped = `
  query fieldsItemTyped {
    fieldsItemTyped
  }
`;

export default {
  fieldsGroups,
  fields,
  getSystemFieldsGroup,
  inboxFields,
  fieldsItemTyped
};
