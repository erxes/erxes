import gql from 'graphql-tag';
import { queries as companyQueries } from 'modules/companies/graphql';
import client from 'apolloClient';
import { Alert } from 'modules/common/utils';
import { queries as userQueries } from 'modules/settings/team/graphql';

const searchCompany = (searchValue, callback) => {
  client
    .query({
      query: gql(companyQueries.companies),
      variables: { searchValue, page: 1, perPage: 10 }
    })
    .then(response => {
      callback && callback(response.data.companies);
    })
    .catch(error => {
      Alert.error(error.message);
    });
};

const searchUser = (searchValue, callback) => {
  client
    .query({
      query: gql(userQueries.users),
      variables: { searchValue, page: 1, perPage: 10 }
    })
    .then(response => {
      callback && callback(response.data.users);
    })
    .catch(error => {
      Alert.error(error.message);
    });
};

export { searchCompany, searchUser };
