import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import List from '../components/ProductList';
import React from 'react';
import { Bulk, withProps, router, Spinner } from '@erxes/ui/src';
import { graphql } from 'react-apollo';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import { RemainderProductsQueryResponse } from '../types';
import { queries } from '../graphql';
import { FILTER_PARAMS } from '../../constants';
import queryString from 'query-string';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  remainderProductsQuery: RemainderProductsQueryResponse;
} & Props &
  IRouterProps;

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
    const { remainderProductsQuery, queryParams } = this.props;

    if (remainderProductsQuery.loading) {
      return <Spinner />;
    }
    const products =
      (remainderProductsQuery.remainderProducts &&
        remainderProductsQuery.remainderProducts.products) ||
      [];
    const totalCount =
      (remainderProductsQuery.remainderProducts &&
        remainderProductsQuery.remainderProducts.totalCount) ||
      0;

    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      products,
      totalCount,
      loading: remainderProductsQuery.loading,
      searchValue,

      onFilter: this.onFilter,
      onSelect: this.onSelect,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter
    };

    const productList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.remainderProductsQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      RemainderProductsQueryResponse,
      { page: number; perPage: number }
    >(gql(queries.remainderProducts), {
      name: 'remainderProductsQuery',
      options: ({ queryParams }) => ({
        variables: {
          ...router.generatePaginationParams(queryParams || {}),
          categoryId: queryParams.categoryId,
          searchValue: queryParams.searchValue,
          search: queryParams.search,
          departmentId: queryParams.departmentId,
          branchId: queryParams.branchId
        },
        fetchPolicy: 'network-only'
      })
    })
  )(ProductListContainer)
);
