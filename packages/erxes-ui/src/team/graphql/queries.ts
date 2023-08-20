import channelQueries from '@erxes/ui-settings/src/channels/graphql/queries';

const nameFields = `
  firstName
  middleName
  lastName
`;

export const commonStructureParamsDef = `
    $ids: [String]
    $excludeIds: Boolean,
    $perPage: Int,
    $page: Int
    $searchValue: String,
    $status:String,
`;

export const commonStructureParamsValue = `
    ids: $ids
    excludeIds: $excludeIds,
    perPage: $perPage,
    page: $page
    searchValue: $searchValue
    status: $status
`;

const allUsers = `
  query allUsers($isActive: Boolean,$ids:[String],$assignedToMe: String) {
    allUsers(isActive: $isActive,ids:$ids,assignedToMe: $assignedToMe) {
      _id
      email
      username
      isActive
      details {
        avatar
        fullName
        ${nameFields}
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
  ${nameFields}
`;

const listParamsDef = `
  $searchValue: String,
  $isActive: Boolean,
  $ids: [String],
  $brandIds: [String]
  $departmentId: String
  $unitId: String
  $branchId: String
  $departmentIds: [String]
  $branchIds: [String]
  $segment: String,
  $segmentData: String
`;

const listParamsValue = `
  searchValue: $searchValue,
  isActive: $isActive,
  ids: $ids,
  brandIds: $brandIds,
  departmentId: $departmentId,
  unitId: $unitId,
  branchId: $branchId,
  departmentIds: $departmentIds
  branchIds:$branchIds
  segment: $segment,
  segmentData: $segmentData
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
      employeeId
    }
  }
`;

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
  query departments(${commonStructureParamsDef},$withoutUserFilter:Boolean) {
    departments(${commonStructureParamsValue},withoutUserFilter:$withoutUserFilter) {
      ${departmentField}
    }
  }
`;

const departmentsMain = `
  query departmentsMain(${commonStructureParamsDef},$withoutUserFilter:Boolean) {
    departmentsMain(${commonStructureParamsValue},withoutUserFilter:$withoutUserFilter) {
      list {
        ${departmentField}
      }
      totalCount
      totalUsersCount
    }
  }
`;

export const unitField = `
  _id
  title
  description
  departmentId
  department {
    ${departmentField}
  }
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

const unitsMain = `
  query unitsMain(${commonStructureParamsDef}) {
    unitsMain(${commonStructureParamsValue}) {
      list {
        ${unitField}
      }
      totalCount
      totalUsersCount
    }
  }
`;
const units = `
  query units ($searchValue:String) {
    units (searchValue:$searchValue) {
      ${unitField}
    }
  }
`;

export const branchField = `
  _id
  title
  address
  parentId
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
`;

const branches = `
  query branches(${commonStructureParamsDef}, $withoutUserFilter: Boolean) {
    branches (${commonStructureParamsValue}, withoutUserFilter: $withoutUserFilter){
      ${branchField}
      parent {${branchField}}
    }
  }
`;

const branchesMain = `
  query branchesMain(${commonStructureParamsDef}, $withoutUserFilter: Boolean) {
    branchesMain (${commonStructureParamsValue}, withoutUserFilter: $withoutUserFilter){
      list {
        ${branchField}
        parent {${branchField}}
      }
      totalCount
      totalUsersCount
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
      branchIds
      departmentIds

      details {
        ${detailFields}
      }
      links
      emailSignatures
      getNotificationByEmail
      customFieldsData
      score
      employeeId
      brandIds
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

const skillTypes = `
  query skillTypes {
    skillTypes {
      _id
      name
    }
  }
`;

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

  logicAction
  logics {
    fieldId
    logicOperator
    logicValue
  }
  canHide
  validation
  options
  isVisibleToCreate
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
  isRequired

  ${genericFields}

  lastUpdatedUser {
    details {
      fullName
    }
  }
`;

const fieldsGroups = `
  query fieldsGroups($contentType: String!, $isDefinedByErxes: Boolean, $config: JSON) {
    fieldsGroups(contentType: $contentType, isDefinedByErxes: $isDefinedByErxes, config: $config) {
      name
      ${genericFields}
      isMultiple
      parentId
      config
      logicAction
      logics {
        fieldId
        logicOperator
        logicValue
      }
      lastUpdatedUser {
        details {
          fullName
        }
      }
      fields  {
        ${commonFields}
      }
    }
  }
`;

const userMovements = `
  query UserMovements($userId: String!, $contentType: String) {
    userMovements(userId: $userId, contentType: $contentType) {
      _id
      contentType
      contentTypeId
      createdAt
      createdBy
      createdByDetail
      userDetail
      userId
      contentTypeDetail
      status
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
  departmentsMain,
  departmentDetail,
  units,
  unitsMain,
  unitDetail,
  noDepartmentUsers,
  branches,
  branchesMain,
  branchDetail,
  detailFields,
  channels: channelQueries.channels,
  skillTypes,
  fieldsGroups,
  userMovements
};
