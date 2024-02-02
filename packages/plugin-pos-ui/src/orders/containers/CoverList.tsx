import * as compose from 'lodash.flowright';

// import { withRouter } from 'react-router-dom';
import { Alert, Bulk, Spinner, confirm, router } from '@erxes/ui/src';
import {
  CoversCountQueryResponse,
  CoversQueryResponse,
  ListQueryVariables,
  RemoveCoverMutationResponse,
} from '../types';
import { mutations, queries } from '../graphql';

import { FILTER_PARAMS } from '../../constants';
import { IQueryParams } from '@erxes/ui/src/types';
import { IRouterProps } from '@erxes/ui/src/types';
import List from '../components/CoverList';
import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import queryString from 'query-string';

type Props = {
  queryParams: any;
  history: any;
} & IRouterProps;

const CoverListContainer = (props: Props) => {
  const { queryParams, history } = props;

  const coversQuery = useQuery<CoversQueryResponse>(gql(queries.covers), {
    variables: generateParams({ queryParams } || {}),
    fetchPolicy: 'network-only',
  });

  const coversCountQuery = useQuery<CoversCountQueryResponse>(
    gql(queries.coversCount),
    {
      variables: generateParams({ queryParams } || {}),
      fetchPolicy: 'network-only',
    },
  );

  const [removeCover] = useMutation<RemoveCoverMutationResponse>(
    gql(mutations.coversRemove),
  );

  if (coversQuery.loading || coversCountQuery.loading) {
    return <Spinner />;
  }

  const onSearch = (search: string) => {
    router.removeParams(history, 'page');

    if (!search) {
      return router.removeParams(history, 'search');
    }

    router.setParams(history, { search });
  };

  const onSelect = (values: string[] | string, key: string) => {
    router.removeParams(history, 'page');

    if (queryParams.params[key] === values) {
      return router.removeParams(history, key);
    }

    return router.setParams(history, { [key]: values });
  };

  const onFilter = (filterParams: IQueryParams) => {
    router.removeParams(history, 'page');

    for (const key of Object.keys(filterParams)) {
      if (filterParams[key]) {
        router.setParams(history, { [key]: filterParams[key] });
      } else {
        router.removeParams(history, key);
      }
    }

    return router;
  };

  const isFiltered = (): boolean => {
    for (const param in queryParams) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    router.removeParams(history, ...Object.keys(queryParams));
  };

  const remove = (_id: string) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      removeCover({
        variables: { _id },
      })
        .then(() => {
          // refresh queries
          coversQuery.refetch();

          Alert.success('You successfully deleted a pos.');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const ordersList = (bulkProps) => {
    const covers = coversQuery?.data?.posCovers || [];
    const coversCount = coversCountQuery?.data?.posCoversCount || 0;
    const loading = coversQuery.loading || coversCountQuery.loading;

    const updatedProps = {
      ...props,
      covers,
      onFilter,
      onSelect,
      onSearch,
      isFiltered: isFiltered(),
      clearFilter,
      remove,
      coversCount,
      loading,
    };

    return <List {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    coversQuery.refetch();
  };

  return <Bulk content={ordersList} refetch={refetch} />;
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
  userId: queryParams.userId,
  posId: queryParams.posId,
  posToken: queryParams.posToken,
});

export default CoverListContainer;

// export default withRouter<Props>(CoverListContainer);
