import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../../components/accountCategory/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  AccountCategoriesCountQueryResponse,
  AccountCategoryRemoveMutationResponse,
  AccountsQueryResponse
} from '../../types';
import { AccountCategoriesQueryResponse } from '@erxes/ui-accounts/src/types';
type Props = { history: any; queryParams: any };

type FinalProps = {
  accountCategoriesQuery: AccountCategoriesQueryResponse;
  accountCategoriesCountQuery: AccountCategoriesCountQueryResponse;
  accountsQuery: AccountsQueryResponse;
} & Props &
  AccountCategoryRemoveMutationResponse;
class AccountListContainer extends React.Component<FinalProps> {
  render() {
    const {
      accountCategoriesQuery,
      accountCategoriesCountQuery,
      accountsQuery,
      accountCategoryRemove
    } = this.props;

    const remove = accountId => {
      confirm().then(() => {
        accountCategoryRemove({
          variables: { _id: accountId }
        })
          .then(() => {
            accountCategoriesQuery.refetch();
            accountCategoriesCountQuery.refetch();
            accountsQuery.refetch();

            Alert.success(`You successfully deleted a account category`);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const accountCategories = accountCategoriesQuery.accountCategories || [];

    const updatedProps = {
      ...this.props,
      remove,
      accountCategories,
      loading: accountCategoriesQuery.loading,
      accountCategoriesCount:
        accountCategoriesCountQuery.accountCategoriesTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['accountCategories', 'accountCategoriesTotalCount', 'accounts'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, AccountCategoriesQueryResponse, { parentId: string }>(
      gql(queries.accountCategories),
      {
        name: 'accountCategoriesQuery',
        options: ({ queryParams }) => ({
          variables: {
            status: queryParams.status,
            parentId: queryParams.parentId
          },
          refetchQueries: getRefetchQueries(),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, AccountCategoriesCountQueryResponse>(
      gql(queries.accountCategoriesCount),
      {
        name: 'accountCategoriesCountQuery'
      }
    ),
    graphql<Props, AccountCategoryRemoveMutationResponse, { _id: string }>(
      gql(mutations.accountCategoryRemove),
      {
        name: 'accountCategoryRemove',
        options
      }
    ),
    graphql<Props, AccountsQueryResponse>(gql(queries.accounts), {
      name: 'accountsQuery'
    })
  )(AccountListContainer)
);
