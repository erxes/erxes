import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

const GET_USER = gql`
  query UserDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      isOwner
      score
      details {
        avatar
        shortName
        birthDate
        workStartedDate
        location
        description
        firstName
        middleName
        lastName
        operatorPhone
      }
      links
      employeeId
      isSubscribed
      propertiesData
    }
  }
`;

const GET_USERS_QUERY = gql`
  query Users(
    ${GQL_CURSOR_PARAM_DEFS}
    $status: String
    $excludeIds: Boolean
    $searchValue: String
    $brandIds: [String]
    $entityIds: [String]
    $segment: String
    $isActive: Boolean
  ) {
    users(
      ${GQL_CURSOR_PARAMS}
      status: $status
      excludeIds: $excludeIds
      searchValue: $searchValue
      brandIds: $brandIds
      entityIds: $entityIds
      segment: $segment
      isActive: $isActive
    ) {
      list {
        _id
        username
        email
        status
        isActive
        groupIds
        brandIds
        score
        details {
          avatar
          shortName
          birthDate
          workStartedDate
          location
          description
          firstName
          middleName
          lastName
          operatorPhone
        }
        links
        employeeId
        structureMemberships {
          _id
          entityId
          seatIds
          seats {
            _id
            coverage
            position {
              _id
              name
            }
          }
          isPrimary
          entity {
            _id
            typeId
            title
            code
            order
          }
        }
        propertiesData
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

const GET_SEGMENTS_QUERY = gql`
  query segments($contentTypes: [String]!) {
    segments(contentTypes: $contentTypes) {
      _id
      contentType
      name
      description
      color
      root
    }
  }
`;

const queries = {
  GET_USERS_QUERY,
  GET_SEGMENTS_QUERY,
  GET_USER,
};

export default queries;
