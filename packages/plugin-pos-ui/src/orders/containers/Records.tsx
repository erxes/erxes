import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import Records from '../components/Records';
import queryString from 'query-string';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { IRouterProps } from '@erxes/ui/src/types';
import { ListQueryVariables, OrderRecordsQueryResponse } from '../types';
import { queries } from '../graphql';
import { withRouter } from 'react-router-dom';
import { Bulk, getEnv, withProps, router, Spinner } from '@erxes/ui/src';
import { FILTER_PARAMS } from '../../constants';
import { IQueryParams } from '@erxes/ui/src/types';
import { OrderRecordsCountQueryResponse } from '../../../.erxes/plugin-src/orders/types';
import { generateParams } from './List';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  ordersQuery: OrderRecordsQueryResponse;
  ordersCountQuery: OrderRecordsCountQueryResponse;
} & Props &
  IRouterProps;

type State = {
  loading: boolean;
};

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class OrdersContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onSearch = (search: string) => {
    router.removeParams(this.props.history, 'page');

    if (!search) {
      return router.removeParams(this.props.history, 'search');
    }

    router.setParams(this.props.history, { search });
  };

  onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(this.props.history);
    router.removeParams(this.props.history, 'page');

    if (params[key] === values) {
      return router.removeParams(this.props.history, key);
    }

    return router.setParams(this.props.history, { [key]: values });
  };

  onFilter = (filterParams: IQueryParams) => {
    router.removeParams(this.props.history, 'page');

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
    const { ordersQuery, ordersCountQuery } = this.props;

    if (ordersQuery.loading || ordersCountQuery.loading) {
      return <Spinner />;
    }

    const list = ordersQuery.posOrderRecords || [];
    const count = ordersCountQuery.posOrderRecordsCount || [];

    const exportOrderRecords = headers => {
      const { REACT_APP_API_URL } = getEnv();
      const { queryParams } = this.props;
      const params = generateParams({ queryParams });

      const stringified = queryString.stringify({
        ...params
      });

      window.open(
        `${REACT_APP_API_URL}/pl:pos/file-export?${stringified}`,
        '_blank'
      );
    };

    const updatedProps = {
      ...this.props,
      orders: list,
      count,
      loading: ordersQuery.loading,

      onFilter: this.onFilter,
      onSelect: this.onSelect,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter,
      exportRecord: exportOrderRecords
    };

    const ordersList = props => {
      return <Records {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.ordersQuery.refetch();
    };

    return <Bulk content={ordersList} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { queryParams: any },
      OrderRecordsQueryResponse,
      ListQueryVariables
    >(gql(queries.posOrderRecords), {
      name: 'ordersQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<
      { queryParams: any },
      OrderRecordsCountQueryResponse,
      ListQueryVariables
    >(gql(queries.posOrderRecordsCount), {
      name: 'ordersCountQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    })
  )(withRouter<IRouterProps>(OrdersContainer))
);
