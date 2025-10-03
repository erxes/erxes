import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';

export const GET_USERS = gql`
  query Users(
    $searchValue: String
    $ids: [String]
    $excludeIds: Boolean
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    users(
      searchValue: $searchValue
      ids: $ids
      excludeIds: $excludeIds
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        details {
          avatar
          fullName
        }
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_USERS_GROUP = gql`
  query UsersGroups($searchValue: String, $orderBy: JSON, ${GQL_CURSOR_PARAM_DEFS}) {
    usersGroups(searchValue: $searchValue, orderBy: $orderBy,${GQL_CURSOR_PARAMS}) {
      list {
        _id
        name
        description
        memberIds
        members {
          _id
          details {
            fullName
            avatar
          }
        }
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_USER_INLINE_DETAIL = gql`
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      status
      details {
        avatar
        fullName
        shortName
        position
        workStartedDate
        firstName
        middleName
        lastName
      }
      employeeId
    }
  }
`;

export const GET_ASSIGNED_MEMBER = gql`
  query AssignedMember($_id: String) {
    userDetail(_id: $_id) {
      _id
      details {
        avatar
        fullName
      }
    }
  }
`;
