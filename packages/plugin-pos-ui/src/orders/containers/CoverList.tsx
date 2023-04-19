import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import List from '../components/CoverList';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  ListQueryVariables,
  CoversQueryResponse,
  RemoveCoverMutationResponse
} from '../types';
import { mutations, queries } from '../graphql';
import { withRouter } from 'react-router-dom';
import {
  Alert,
  confirm,
  withProps,
  Bulk,
  router,
  Spinner
} from '@erxes/ui/src';
import { FILTER_PARAMS } from '../../constants';
import { IQueryParams } from '@erxes/ui/src/types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  coversQuery: CoversQueryResponse;
} & Props &
  RemoveCoverMutationResponse &
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
    const { coversQuery, removeCover } = this.props;

    if (coversQuery.loading) {
      return <Spinner />;
    }

    const remove = (_id: string) => {
      const message = 'Are you sure?';

      confirm(message).then(() => {
        removeCover({
          variables: { _id }
        })
          .then(() => {
            // refresh queries
            coversQuery.refetch();

            Alert.success('You successfully deleted a pos.');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const covers = coversQuery.posCovers || [];

    const updatedProps = {
      ...this.props,
      covers,
      onFilter: this.onFilter,
      onSelect: this.onSelect,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter,
      remove
    };

    const ordersList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.coversQuery.refetch();
    };

    return <Bulk content={ordersList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
  userId: queryParams.userId,
  posId: queryParams.posId
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, CoversQueryResponse, ListQueryVariables>(
      gql(queries.covers),
      {
        name: 'coversQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, RemoveCoverMutationResponse, { _id: string }>(
      gql(mutations.coversRemove),
      {
        name: 'removeCover'
      }
    )
  )(withRouter<IRouterProps>(OrdersContainer))
);
