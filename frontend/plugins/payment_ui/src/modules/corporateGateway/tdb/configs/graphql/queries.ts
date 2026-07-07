import gql from 'graphql-tag';
import { configFields } from './fragments';

export const configs = gql`
  query tdbConfigs {
    tdbConfigs {
      ${configFields}
    }
  }
`;

export const getConfig = gql`
  query tdbConfigDetail($_id: String!) {
    tdbConfigDetail(_id: $_id) {
      ${configFields}
    }
  }
`;

export const configsList = gql`
  query tdbConfigsList($page: Int, $perPage: Int) {
    tdbConfigsList(page: $page, perPage: $perPage) {
      list {
        ${configFields}
      }
      totalCount
    }
  }
`;

export const configDetail = gql`
  query tdbConfigsDetail($_id: String!) {
    tdbConfigsDetail(_id: $_id) {
      ${configFields}
    }
  }
`;
