import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';
import { gql } from '@apollo/client';

export const LOGS_MAIN_LIST = gql`
query LogsMainList(${GQL_CURSOR_PARAM_DEFS},$searchValue: String, $page: Int, $perPage: Int, $ids: [String], $excludeIds: [String], $filters: JSON) {
  logsMainList(${GQL_CURSOR_PARAMS},searchValue: $searchValue, page: $page, perPage: $perPage, ids: $ids, excludeIds: $excludeIds, filters: $filters) {
    list {
      _id
      createdAt
      source
      action
      status
      userId
      cursor
      user {
        _id
        email
        details {
          avatar
          firstName
          fullName
        }
      }
    }
    ${GQL_PAGE_INFO}
  }
}
`;

export const LOG_DETAIL = gql`
  query LogDetail($id: String!) {
    logDetail(_id: $id) {
      _id
      createdAt
      payload
      source
      action
      status
      userId
      user {
        _id
        email
        details {
          avatar
          firstName
          fullName
        }
      }
      prevObject
    }
  }
`;
