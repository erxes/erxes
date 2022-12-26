import * as compose from 'lodash.flowright';

import { Alert, confirm } from '@erxes/ui/src/utils';
import { SitesQueryResponse, SitesRemoveMutationResponse } from '../../types';
import { mutations, queries } from '../../graphql';

import List from '../../components/sites/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  queryParams: any;
  getActionBar: (actionBar: any) => void;
  setCount: (count: number) => void;
  sitesCount: number;
  selectedSite: string;
};

type FinalProps = {
  sitesQuery: SitesQueryResponse;
} & Props &
  SitesRemoveMutationResponse;

function SitesContainer(props: FinalProps) {
  const { sitesQuery, sitesRemoveMutation, selectedSite, queryParams } = props;

  if (sitesQuery.loading) {
    return <Spinner objective={true} />;
  }

  const sites = sitesQuery.webbuilderSites || [];
  const searchValue = queryParams.searchValue || '';

  const remove = (_id: string) => {
    if (_id === selectedSite) {
      localStorage.removeItem('webbuilderSiteId');
    }

    const message = `This will permanently delete the current site. Are you absolutely sure?`;

    confirm(message, { hasDeleteConfirm: true }).then(() => {
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
    searchValue
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<Props, SitesQueryResponse>(gql(queries.sites), {
    name: 'sitesQuery',
    options: ({ queryParams }) => ({
      variables: {
        ...generatePaginationParams(queryParams || {}),
        searchValue: queryParams.searchValue
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<Props, SitesRemoveMutationResponse>(gql(mutations.sitesRemove), {
    name: 'sitesRemoveMutation',
    options: ({ selectedSite }) => ({
      refetchQueries: [
        { query: gql(queries.sites), variables: { fromSelect: true } },
        {
          query: gql(queries.sitesTotalCount)
        },
        {
          query: gql(queries.contentTypes),
          variables: { siteId: selectedSite }
        }
      ]
    })
  })
)(SitesContainer);
