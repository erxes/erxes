import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import List from '../../components/sites/List';
import { queries, mutations } from '../../graphql';
import React from 'react';
import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  SitesQueryResponse,
  SitesRemoveMutationResponse,
  SitesTotalCountQueryResponse
} from '../../types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  queryParams: any;
  getActionBar: (actionBar: any) => void;
  setCount: (count: number) => void;
};

type FinalProps = {
  sitesQuery: SitesQueryResponse;
  sitesTotalCountQuery: any;
} & Props &
  SitesRemoveMutationResponse;

function SitesContainer(props: FinalProps) {
  const { sitesQuery, sitesTotalCountQuery, sitesRemoveMutation } = props;

  if (sitesQuery.loading) {
    return <Spinner objective={true} />;
  }

  const sites = sitesQuery.webbuilderSites || [];
  const sitesCount = sitesTotalCountQuery.webbuilderSitesTotalCount || 0;

  const remove = (_id: string) => {
    confirm().then(() => {
      sitesRemoveMutation({ variables: { _id } })
        .then(() => {
          Alert.success('Successfully removed a site');

          sitesQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    sites,
    remove,
    sitesCount
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<Props, SitesQueryResponse>(gql(queries.sites), {
    name: 'sitesQuery',
    options: ({ queryParams }) => ({
      variables: {
        ...generatePaginationParams(queryParams)
      }
    })
  }),
  graphql<{}, SitesTotalCountQueryResponse>(gql(queries.sitesTotalCount), {
    name: 'sitesTotalCountQuery'
  }),
  graphql<{}, SitesRemoveMutationResponse>(gql(mutations.sitesRemove), {
    name: 'sitesRemoveMutation',
    options: () => ({
      refetchQueries: [
        { query: gql(queries.sites) },
        {
          query: gql(queries.sitesTotalCount)
        }
      ]
    })
  })
)(SitesContainer);
