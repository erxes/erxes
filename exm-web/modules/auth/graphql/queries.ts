import { gql } from "@apollo/client"

const nameFields = `
  firstName
  middleName
  lastName
`

const detailFields = `
  avatar
  fullName
  shortName
  birthDate
  position
  workStartedDate
  location
  description
  operatorPhone
  ${nameFields}
`

const contactInfoFields = `
  phoneNumber
  email
  links
  coordinate {
    longitude
    latitude
  }
  image {
    url
    name
    type
    size
  }
`

export const branchField = `
  _id
  title
  address
  parentId
  supervisorId
  code
  order
  userIds
  userCount
  users {
    _id
    details {
      avatar
      fullName
    }
  }
  radius
  ${contactInfoFields}
`

export const departmentField = `
  _id
  title
  description
  parentId
  code
  order
  supervisorId
  supervisor {
          _id
      username
      email
      status
      isActive
      groupIds
      brandIds
      score

      details {
        ${detailFields}
      }

      links
  }
  userIds
  userCount
  users {
    _id
    details {
      ${detailFields}
    }
  }
`

const currentUser = gql`
  query currentUser {
    currentUser {
      _id
      createdAt
      username
      email
      isOwner
      brands {
        _id
        name
      }
      details {
        avatar
        fullName
        birthDate
        shortName
        workStartedDate
        position
        location
        description
      }
      links
      emailSignatures
      getNotificationByEmail
      permissionActions
      configs
      configsConstants
      departmentIds
      departments {
        ${departmentField}
      }
      branchIds
      branches {
        ${branchField}
      }
      onboardingHistory {
        _id
        userId
        isCompleted
        completedSteps
      }
      isShowNotification
      score
    }
  }
`

export default {
  currentUser,
}
