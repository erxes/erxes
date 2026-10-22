import gql from 'graphql-tag';

export const configs = gql`
  query tdbConfigs {
    tdbConfigs {
      _id
      name
      description
      apiUrl
      clientId
      testMode
    }
  }
`;

export const configsList = gql`
  query tdbConfigsList($limit: Int, $cursor: String) {
    tdbConfigsList(limit: $limit, cursor: $cursor) {
      list {
        _id
        name
        description
        apiUrl
        clientId
        testMode
      }
      totalCount
    }
  }
`;

export const configDetail = gql`
  query tdbConfigsDetail($_id: String!) {
    tdbConfigsDetail(_id: $_id) {
      _id
      name
      description
      apiUrl
      clientId
      testMode
    }
  }
`;