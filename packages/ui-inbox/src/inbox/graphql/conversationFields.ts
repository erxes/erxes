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
  ${
    isEnabled('contacts')
      ? `
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
  `
      : ``
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
  ${
    isEnabled('tags')
      ? `
  tags {
    _id
    name
    colorCode
  }
  `
      : ``
  }
  videoCallData {
    url
    name
  }
  readUserIds
  callProAudio
  customFieldsData
  
  bookingProductId
`;
