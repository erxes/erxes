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

export {
  users,
  allUsers,
  detailFields,
  branches,
  departments,
  units,
  departmentField,
  contactInfoFields,
  unitField,
  branchField
};
