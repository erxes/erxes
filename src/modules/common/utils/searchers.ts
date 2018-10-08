import client from 'apolloClient';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries as companyQueries } from 'modules/companies/graphql';
import { queries as customerQueries } from 'modules/customers/graphql';
import { queries as userQueries } from 'modules/settings/team/graphql';

const searchCompany = (searchValue: string, callback: (data?: any) => void) => {
  client
    .query({
      query: gql(companyQueries.companies),
      variables: { searchValue, page: 1, perPage: 10 }
    })
    .then(
      (response: any): void => {
        if (typeof callback === 'function') {
          callback(response.data.companies);
        }
      }
    )
    .catch(error => {
      Alert.error(error.message);
    });
};

const searchCustomer = (
  searchValue: string,
  callback: (data?: any) => void
) => {
  client
    .query({
      query: gql(customerQueries.customers),
      variables: { searchValue, page: 1, perPage: 10 }
    })
    .then((response: any) => {
      if (typeof callback === 'function') {
        callback(response.data.customers);
      }
    })
    .catch(error => {
      Alert.error(error.message);
    });
};

const searchUser = (searchValue: string, callback: (data?: any) => void) => {
  client
    .query({
      query: gql(userQueries.users),
      variables: { searchValue, page: 1, perPage: 10 }
    })
    .then((response: any) => {
      if (typeof callback === 'function') {
        callback(response.data.users);
      }
    })
    .catch(error => {
      Alert.error(error.message);
    });
};

export { searchCompany, searchCustomer, searchUser };
