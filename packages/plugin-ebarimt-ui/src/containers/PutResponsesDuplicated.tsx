import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import PutResponseDuplicated from '../components/PutResponsesDuplicated';
import queryString from 'query-string';
import React from 'react';
import { Spinner, WithPermission } from '@erxes/ui/src/components';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { graphql } from '@apollo/client/react/hoc';
import { IRouterProps, IQueryParams } from '@erxes/ui/src/types';
import {
  ListDuplicatedQueryVariables,
  PutResponsesDuplicatedCountQueryResponse,
  PutResponsesDuplicatedDetailQueryResponse,
  PutResponsesDuplicatedQueryResponse
} from '../types';
import { queries } from '../graphql';
import { withRouter } from 'react-router-dom';
import { FILTER_PARAMS } from '../constants';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  PutResponsesDuplicatedQuery: PutResponsesDuplicatedQueryResponse;
  PutResponsesDuplicatedCountQuery: PutResponsesDuplicatedCountQueryResponse;
  PutResponsesDuplicatedDetailQuery: PutResponsesDuplicatedDetailQueryResponse;
} & Props &
  IRouterProps;

type State = {
  loading: boolean;
};

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class PutResponsesDuplicatedContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onSearch = (search: string, key?: string) => {
    router.removeParams(this.props.history, 'page');

    if (!search) {
      return router.removeParams(this.props.history, key || 'search');
    }

    router.setParams(this.props.history, { [key || 'search']: search });
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
    const {
      PutResponsesDuplicatedQuery,
      PutResponsesDuplicatedCountQuery
    } = this.props;

    if (
      PutResponsesDuplicatedQuery.loading ||
      PutResponsesDuplicatedCountQuery.loading
    ) {
      return <Spinner />;
    }

    let errorMsg: string = '';
    if (PutResponsesDuplicatedQuery.error) {
      errorMsg = PutResponsesDuplicatedQuery.error.message;
      Alert.error(errorMsg);
    }

    const putResponsesDuplicated = PutResponsesDuplicatedQuery.putResponsesDuplicated || [];
    const putResponsesDuplicatedCount = PutResponsesDuplicatedCountQuery.putResponsesDuplicatedCount || 0;

    const updatedProps = {
      ...this.props,
      errorMsg,
      putResponsesDuplicated,
      totalCount: putResponsesDuplicatedCount,
      loading: PutResponsesDuplicatedQuery.loading,

      onFilter: this.onFilter,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter
    };

    return <PutResponseDuplicated {...updatedProps} />;
  }
}

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  billType: queryParams.billType,
  startDate: queryParams.createdStartDate,
  endDate: queryParams.createdEndDate,
});

export default withProps<Props>(
  compose(
    graphql<
      { queryParams: any },
      PutResponsesDuplicatedQueryResponse,
      ListDuplicatedQueryVariables
    >(gql(queries.putResponsesDuplicated), {
      name: 'PutResponsesDuplicatedQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<
      { queryParams: any },
      PutResponsesDuplicatedCountQueryResponse,
      ListDuplicatedQueryVariables
    >(gql(queries.putResponsesDuplicatedCount), {
      name: 'PutResponsesDuplicatedCountQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    }),
  )(withRouter<IRouterProps>(PutResponsesDuplicatedContainer))
);
