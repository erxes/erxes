const genericFields = `
  _id
  description
  code
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
  locationOptions{
    lat
    lng
    description
  }
  objectListConfigs{
    key
    label
    type
  }
  groupId
  searchable
  showInCard

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
  config

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

const fieldsGetTypes = `
  query fieldsGetTypes {
    fieldsGetTypes
  }
`;

const fieldsGroups = `
  query fieldsGroups($contentType: String!, $isDefinedByErxes: Boolean, $config: JSON) {
    fieldsGroups(contentType: $contentType, isDefinedByErxes: $isDefinedByErxes, config: $config) {
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
      objectListConfigs{
        key
        label
        type
      }
    }
  }
`;

const inboxFields = `
  query inboxFields {
    inboxFields {
      customer { ${commonFields} }
      device { ${commonFields} }
      conversation { ${commonFields} }
    }
  }
`;

const cardsFields = `
  query cardsFields {
    cardsFields
  }
`;

const configs = `
  query configs {
    configs {
      _id
      code
      value
    }
  }
`;

export default {
  fieldsGroups,
  fieldsGetTypes,
  fields,
  getSystemFieldsGroup,
  inboxFields,
  cardsFields,
  configs
};
