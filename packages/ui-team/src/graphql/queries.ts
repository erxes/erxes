import * as teamQueries from '@erxes/ui/src/team/graphql';

const detailFields = teamQueries.detailFields;

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

const listParamsDef = `
  $searchValue: String,
  $isActive: Boolean,
  $ids: [String],
  $brandIds: [String],
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

const users = teamQueries.users;

const allUsers = teamQueries.allUsers;

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

      ${teamQueries.contactInfoFields}
    }
  }
`;

const departments = teamQueries.departments;

const departmentDetail = `
  query departmentDetail($_id: String) {
    departmentDetail(_id: $_id) {
      ${teamQueries.departmentField}
    }
  }
`;

const units = teamQueries.units;
const unitDetail = `
  query unitDetail($_id: String) {
    unitDetail(_id: $_id) {
      ${teamQueries.unitField}
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

const branches = teamQueries.branches;

const branchDetail = `
  query branchDetail($_id: String) {
    branchDetail(_id: $_id) {
      ${teamQueries.branchField}
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
  branchDetail
};
