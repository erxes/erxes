import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import List from '../components/List';
import queryString from 'query-string';
import React from 'react';
import { Alert, confirm, router, withProps } from '@erxes/ui/src/utils';
import { Bulk, Spinner } from '@erxes/ui/src/components';
import { FILTER_PARAMS } from '../../constants';
import { graphql } from 'react-apollo';
import { IQueryParams, IRouterProps } from '@erxes/ui/src/types';
import {
  ISafeRemainder,
  RemoveSafeRemainderMutationResponse,
  SafeRemaindersQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  safeRemaindersQuery: SafeRemaindersQueryResponse;
} & Props &
  IRouterProps &
  RemoveSafeRemainderMutationResponse;

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class ProductListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      mergeProductLoading: false
    };
  }

  onSearch = (search: string) => {
    if (!search) {
      return router.removeParams(this.props.history, 'search');
    }

    router.setParams(this.props.history, { search });
  };

  onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(this.props.history);

    if (params[key] === values) {
      return router.removeParams(this.props.history, key);
    }

    return router.setParams(this.props.history, { [key]: values });
  };

  onFilter = (filterParams: IQueryParams) => {
    for (const key of Object.keys(filterParams)) {
      if (filterParams[key]) {
        router.setParams(this.props.history, { [key]: filterParams[key] });
      } else {
        router.removeParams(this.props.history, key);
      }
    }

    return router;
  };

  isFiltered = (): boolean => {
    const params = generateQueryParams(this.props.history);

    for (const param in params) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  clearFilter = () => {
    const params = generateQueryParams(this.props.history);
    router.removeParams(this.props.history, ...Object.keys(params));
  };

  render() {
    const {
      safeRemaindersQuery,
      queryParams,
      removeSafeRemainder
    } = this.props;

    if (safeRemaindersQuery.loading) {
      return <Spinner />;
    }

    const removeRemainder = (remainder: ISafeRemainder) => {
      confirm(`This action will remove the remainder. Are you sure?`)
        .then(() => {
          removeSafeRemainder({ variables: { _id: remainder._id } })
            .then(() => {
              Alert.success('You successfully deleted a census');
              safeRemaindersQuery.refetch();
            })
            .catch(e => {
              Alert.error(e.message);
            });
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const remainders =
      (safeRemaindersQuery.safeRemainders &&
        safeRemaindersQuery.safeRemainders.remainders) ||
      [];
    const totalCount =
      (safeRemaindersQuery.safeRemainders &&
        safeRemaindersQuery.safeRemainders.totalCount) ||
      0;

    const searchValue = this.props.queryParams.searchValue || '';
    const departmentId = this.props.queryParams.departmentId || '';
    const branchId = this.props.queryParams.branchId || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      remainders,
      totalCount,
      loading: safeRemaindersQuery.loading,
      searchValue,
      departmentId,
      branchId,
      removeRemainder,
      onFilter: this.onFilter,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter
    };

    const productList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.safeRemaindersQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const generateOptions = () => ({
  refetchQueries: ['safeRemaindersQuery']
});

export default withProps<Props>(
  compose(
    graphql<
      Props,
      SafeRemaindersQueryResponse,
      { page: number; perPage: number }
    >(gql(queries.safeRemainders), {
      name: 'safeRemaindersQuery',
      options: ({ queryParams }) => ({
        variables: {
          ...router.generatePaginationParams(queryParams || {}),
          beginDate: queryParams.beginDate,
          endDate: queryParams.endDate,
          productId: queryParams.productId,
          departmentId: queryParams.departmentId,
          branchId: queryParams.branchId
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, RemoveSafeRemainderMutationResponse, { _id: string }>(
      gql(mutations.removeSafeRemainder),
      {
        name: 'removeSafeRemainder',
        options: () => ({
          refetchQueries: ['safeRemaindersQuery']
        })
      }
    )
  )(ProductListContainer)
);
