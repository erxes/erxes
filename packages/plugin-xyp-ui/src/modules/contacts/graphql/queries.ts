const list = `
  query listQuery {
    xypDataList {
      _id
      contentType
      contentTypeId
      data
    }
  }
`;
const serviceChoosen = `
  query xypServiceListChoosen {
    xypServiceListChoosen
  }
`;
const detail = `
query xypDataDetail($id: String, $contentType: String, $contentTypeId: String) {
  xypDataDetail(_id: $id, contentType: $contentType, contentTypeId: $contentTypeId) {
    _id
    contentType
    contentTypeId
    createdAt
    data
    updatedAt
  }
}`;
const customerDetail = `
query customerDetail($_id: String!) {
  customerDetail(_id: $_id) {
    _id
    firstName
    middleName
    lastName
    avatar
    sex
    birthDate
    primaryEmail
    emails
    primaryPhone
    phones
    state
    visitorContactInfo
    modifiedAt
    position
    department
    leadStatus
    hasAuthority
    description
    isSubscribed
    code
    emailValidationStatus
    phoneValidationStatus
    score
    isOnline
    lastSeenAt
    sessionCount
    links
    ownerId
    integrationId
    createdAt
    remoteAddress
    location
    customFieldsData
    trackedData
    tagIds
    urlVisits
    __typename
  }
}`;
const totalCount = `
  query xypsTotalCount{
    xypsTotalCount
  }
`;
const xypRequest = `
query xypRequest($params: JSON, $wsOperationName: String!) {
  xypRequest(params: $params, wsOperationName: $wsOperationName)
}
`;
const xypServiceList = `
query xypServiceListAll {
  xypServiceList
}`;

const fieldsGroups = `
query fieldsGroups($contentType: String!, $isDefinedByErxes: Boolean, $config: JSON) {
  fieldsGroups(
    contentType: $contentType
    isDefinedByErxes: $isDefinedByErxes
    config: $config
  ) {
    name
    _id
    description
    code
    order
    isVisible
    isVisibleInDetail
    contentType
    isDefinedByErxes
    logicAction
    logics {
      fieldId
      logicOperator
      logicValue
      __typename
    }
    isMultiple
    alwaysOpen
    parentId
    config
    lastUpdatedUser {
      details {
        fullName
        __typename
      }
      __typename
    }
    fields {
      type
      text
      canHide
      validation
      options
      isVisibleToCreate
      locationOptions {
        lat
        lng
        description
        __typename
      }
      objectListConfigs {
        key
        label
        type
        __typename
      }
      groupId
      searchable
      showInCard
      isRequired
      _id
      description
      code
      order
      isVisible
      isVisibleInDetail
      contentType
      isDefinedByErxes
      logicAction
      logics {
        fieldId
        logicOperator
        logicValue
        __typename
      }
      lastUpdatedUser {
        details {
          fullName
          __typename
        }
        __typename
      }
      logicAction
      logics {
        fieldId
        logicOperator
        logicValue
        __typename
      }
      relationType
      __typename
    }
    __typename
  }
}`;
export default {
  detail,
  customerDetail,
  xypRequest,
  list,
  totalCount,
  serviceChoosen,
  xypServiceList,
  fieldsGroups
};
