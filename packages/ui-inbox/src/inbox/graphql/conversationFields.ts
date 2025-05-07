import { isEnabled } from '@erxes/ui/src/utils/core';

export default `
  _id
  content
  status
  assignedUserId
  createdAt
  updatedAt
  operatorStatus
  assignedUser {
    _id
    username
    details {
      avatar
      fullName
      position
    }
  }
  integration {
    _id
    kind
    brandId,
    brand {
      _id
      name
    }
    channels {
      _id
      name
    }
  }
  customerId
  customer {
    _id
    visitorContactInfo
    trackedData
    isOnline
    avatar
    firstName
    middleName
    lastName
    emails
  }
  messageCount
  participatorCount
  participatedUserIds
  participatedUsers {
    _id
    username
    details {
      avatar
      fullName
      position
    }
  }
  tagIds

  tags {
    _id
    name
    colorCode
  }

  ${
    isEnabled('dailyco')
      ? `
  videoCallData {
    url
    name
  }`
      : ''
  }

    ${
      isEnabled('calls')
        ? `
  callHistory {
    customerPhone
    operatorPhone
    callDuration
    callStartTime
    callEndTime
    callType
    callStatus
    sessionId
    modifiedAt
    createdAt
    createdBy
    modifiedBy
    recordUrl
  }`
        : ''
    }

${
  isEnabled('cloudflarecalls')
        ? `
  cloudflareCallsHistory {
    customerPhone
    callDuration
    callStartTime
    callEndTime
    callType
    callStatus
    modifiedAt
    createdAt
    createdBy
    modifiedBy
    recordUrl
  }`
        : ''
    }
  readUserIds
  readUsers {
    _id
    username
    details {
      avatar
      fullName
      position
    }
  }
  callProAudio
  customFieldsData
`;
