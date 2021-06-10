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

export const logicCommonTypes = `
  fieldId
  logicOperator
  logicValue
  logicAction
`;

const fields = `
  query fields($contentType: String!, $contentTypeId: String, $isVisible: Boolean, $boardId: String, $pipelineId: String) {
    fields(contentType: $contentType, contentTypeId: $contentTypeId, isVisible: $isVisible, boardId: $boardId, pipelineId: $pipelineId) {
      _id
      type
      validation
      text
      description
      options
      hasCustomOptions
      isRequired
      isDefinedByErxes
      order
      associatedFieldId
      
      column
      associatedField {
        _id
        text
        contentType
      }
      logics {
        ${logicCommonTypes}
      }
      actions {
        ${logicCommonTypes}
        tagIds
        pipelineId
        boardId
        stageId
        itemId
        itemName
      }
      groupName
      stageId
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
