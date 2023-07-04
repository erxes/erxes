import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../../components/account/AccountList';
import { mutations, queries } from '../../graphql';
import {
  CategoryDetailQueryResponse,
  MergeMutationResponse,
  MergeMutationVariables,
  AccountRemoveMutationResponse,
  AccountsCountQueryResponse,
  AccountsQueryResponse
} from '../../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  accountsQuery: AccountsQueryResponse;
  accountsCountQuery: AccountsCountQueryResponse;
  accountCategoryDetailQuery: CategoryDetailQueryResponse;
} & Props &
  AccountRemoveMutationResponse &
  MergeMutationResponse;

class AccountListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
    this.state = {
      mergeAccountLoading: false
    };
  }

  render() {
    const {
      accountsQuery,
      accountsCountQuery,
      accountsRemove,
      accountsMerge,
      queryParams,
      accountCategoryDetailQuery,
      history
    } = this.props;

    if (accountsQuery.loading) {
      return false;
    }

    const accounts = accountsQuery.accounts || [];

    // remove action
    const remove = ({ accountIds }, emptyBulk) => {
      accountsRemove({
        variables: { accountIds }
      })
        .then(removeStatus => {
          emptyBulk();

          const status = removeStatus.data.accountsRemove;

          status === 'deleted'
            ? Alert.success('You successfully deleted a account')
            : Alert.warning('Account status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const mergeAccounts = ({ ids, data, callback }) => {
      this.setState({ mergeAccountLoading: true });

      accountsMerge({
        variables: {
          accountIds: ids,
          accountFields: data
        }
      })
        .then((result: any) => {
          callback();
          this.setState({ mergeAccountLoading: false });
          Alert.success('You successfully merged a account');
          history.push(
            `/settings/account/details/${result.data.accountsMerge._id}`
          );
        })
        .catch(e => {
          Alert.error(e.message);
          this.setState({ mergeAccountLoading: false });
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      accounts,
      remove,
      loading: accountsQuery.loading,
      searchValue,
      accountsCount: accountsCountQuery.accountsTotalCount || 0,
      currentCategory: accountCategoryDetailQuery.accountCategoryDetail || {},
      mergeAccounts
    };

    const accountList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.accountsQuery.refetch();
    };

    return <Bulk content={accountList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return [
    'accounts',
    'accountCategories',
    'accountCategoriesCount',
    'accountsTotalCount',
    'accountCountByTags'
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, AccountsQueryResponse, { page: number; perPage: number }>(
      gql(queries.accounts),
      {
        name: 'accountsQuery',
        options: ({ queryParams }) => ({
          variables: {
            categoryId: queryParams.categoryId,
            tag: queryParams.tag,
            searchValue: queryParams.searchValue,
            type: queryParams.type,
            segment: queryParams.segment,
            segmentData: queryParams.segmentData,
            ...generatePaginationParams(queryParams)
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, AccountsCountQueryResponse>(gql(queries.accountsCount), {
      name: 'accountsCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          segment: queryParams.segment,
          segmentData: queryParams.segmentData
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, AccountRemoveMutationResponse, { accountIds: string[] }>(
      gql(mutations.accountsRemove),
      {
        name: 'accountsRemove',
        options
      }
    ),
    graphql<Props, CategoryDetailQueryResponse>(
      gql(queries.accountCategoryDetail),
      {
        name: 'accountCategoryDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.categoryId
          }
        })
      }
    ),
    graphql<Props, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.accountsMerge),
      {
        name: 'accountsMerge'
      }
    )
  )(AccountListContainer)
);
