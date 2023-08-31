import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import Summary from '../components/Summary';
import queryString from 'query-string';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { IRouterProps } from '@erxes/ui/src/types';
import { ListQueryVariables, OrdersGroupSummaryQueryResponse } from '../types';
import { queries } from '../graphql';
import { withRouter } from 'react-router-dom';
import { withProps, router, Spinner } from '@erxes/ui/src';
import { FILTER_PARAMS } from '../../constants';
import { IQueryParams } from '@erxes/ui/src/types';
import { generateParams } from './List';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  ordersGroupSummaryQuery: OrdersGroupSummaryQueryResponse;
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
    const { ordersGroupSummaryQuery } = this.props;

    if (ordersGroupSummaryQuery.loading) {
      return <Spinner />;
    }

    const summary = ordersGroupSummaryQuery.posOrdersGroupSummary;

    const updatedProps = {
      ...this.props,
      loading: ordersGroupSummaryQuery.loading,
      summary,
      onFilter: this.onFilter,
      onSelect: this.onSelect,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter
    };

    return <Summary {...updatedProps} />;
  }
}

export const genParams = ({ queryParams }) => ({
  ...generateParams({ queryParams }),
  groupField: queryParams.groupField
});

export default withProps<Props>(
  compose(
    graphql<
      { queryParams: any },
      OrdersGroupSummaryQueryResponse,
      ListQueryVariables
    >(gql(queries.posOrdersGroupSummary), {
      name: 'ordersGroupSummaryQuery',
      options: ({ queryParams }) => ({
        variables: genParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    })
  )(withRouter<IRouterProps>(OrdersContainer))
);
