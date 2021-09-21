import * as teamQueries from 'erxes-ui/lib/team/graphql';

const detailFields = teamQueries.detailFields;

const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      status
      groupIds

      details {
        ${detailFields}
      }
      links
      emailSignatures
      getNotificationByEmail
      customFieldsData
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
  $brandIds: [String]
`;

const listParamsValue = `
  searchValue: $searchValue,
  isActive: $isActive,
  ids: $ids,
  brandIds: $brandIds
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

export default {
  userSkills,
  userDetail,
  userConversations,
  users,
  usersTotalCount,
  allUsers
};
