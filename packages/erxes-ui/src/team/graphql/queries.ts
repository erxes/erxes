const allUsers = `
  query allUsers($isActive: Boolean) {
    allUsers(isActive: $isActive) {
      _id
      email
      username
      isActive
      details {
        avatar
        fullName
      }
    }
  }
`;

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
`;

const listParamsDef = `
  $searchValue: String,
  $isActive: Boolean,
  $ids: [String],
  $brandIds: [String]
  $departmentId: String
  $unitId: String
  $branchId: String
`;

const listParamsValue = `
  searchValue: $searchValue,
  isActive: $isActive,
  ids: $ids,
  brandIds: $brandIds,
  departmentId: $departmentId,
  unitId: $unitId,
  branchId: $branchId
`;

const users = `
  query users($page: Int, $perPage: Int, $status: String, $excludeIds: Boolean, ${listParamsDef}) {
    users(page: $page, perPage: $perPage, status: $status, excludeIds: $excludeIds, ${listParamsValue}) {
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
  }
`;

const departmentField = `
  _id
  title
  description
  parentId
  code
  supervisorId
  userIds
  users {
    _id
    details {
      ${detailFields}
    }
  }
`;

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
`;

const departments = `
  query departments {
    departments {
      ${departmentField}
    }
  }
`;

const unitField = `
  _id
  title
  description
  departmentId
  supervisorId
  code
  userIds
  users {
    _id
    details {
      avatar
      fullName
    }
  }
`;

const units = `
  query units {
    units {
      ${unitField}
    }
  }
`;

const branchField = `
  _id
  title
  address
  parentId
  supervisorId
  code
  userIds
  users {
    _id
    details {
      avatar
      fullName
    }
  }
  ${contactInfoFields}
`;

const branches = `
  query branches {
    branches {
      ${branchField}
    }
  }
`;

const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      isActive
      status
      groupIds

      details {
        ${detailFields}
      }
      links
      emailSignatures
      getNotificationByEmail
      customFieldsData
      score
    }
  }
`;

const userConversations = `
  query userConversations($_id: String!, $perPage: Int) {
    userConversations(_id: $_id, perPage: $perPage) {
    list {
      _id
      createdAt
      customer {
        _id
        firstName
        lastName
        middleName
        primaryEmail
        primaryPhone
        }
      }
      totalCount
    }
  }
`;

const usersTotalCount = `
  query usersTotalCount(${listParamsDef}) {
    usersTotalCount(${listParamsValue})
  }
`;

const userSkills = `
  query skills($memberIds: [String], $typeId: String, $list: Boolean) {
    skills(memberIds: $memberIds, typeId: $typeId, list: $list) {
      _id
      name
    }
  }
`;

const structureDetail = `
  query structureDetail {
    structureDetail {
      _id
      title
      description
      code
      supervisorId
      supervisor {
        _id
        email
        details {
          ${detailFields}
        }
      }

      ${contactInfoFields}
    }
  }
`;

const departmentDetail = `
  query departmentDetail($_id: String) {
    departmentDetail(_id: $_id) {
      ${departmentField}
    }
  }
`;

const unitDetail = `
  query unitDetail($_id: String) {
    unitDetail(_id: $_id) {
      ${unitField}
    }
  }
`;

const noDepartmentUsers = `
  query noDepartmentUsers($excludeId: String) {
    noDepartmentUsers(excludeId: $excludeId) {
      _id
      email

      details {
        ${detailFields}
      }
    }
  }
`;

const branchDetail = `
  query branchDetail($_id: String) {
    branchDetail(_id: $_id) {
      ${branchField}
    }
  }
`;

export default {
  userSkills,
  userDetail,
  userConversations,
  users,
  usersTotalCount,
  allUsers,
  structureDetail,
  departments,
  departmentDetail,
  units,
  unitDetail,
  noDepartmentUsers,
  branches,
  branchDetail,
  detailFields
};
