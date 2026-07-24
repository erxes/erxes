import gql from 'graphql-tag';
import { configFields } from './fragments';

export const configs = gql`
  query tdbConfigs {
    tdbConfigs {
      ${configFields}
    }
  }
`;

export const configsList = gql`
  query tdbConfigsList($limit: Int, $cursor: String) {
    tdbConfigsList(limit: $limit, cursor: $cursor) {
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
