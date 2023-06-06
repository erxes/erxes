import * as compose from 'lodash.flowright';

import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  SitesDuplicateMutationResponse,
  SitesQueryResponse,
  SitesRemoveMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import List from '../../components/sites/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

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
  SitesRemoveMutationResponse &
  SitesDuplicateMutationResponse;

function SitesContainer(props: FinalProps) {
  const {
    sitesQuery,
    sitesRemoveMutation,
    sitesDuplicateMutation,
    selectedSite,
    queryParams
  } = props;

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

  const duplicate = (_id: string) => {
    confirm().then(() => {
      sitesDuplicateMutation({ variables: { _id } })
        .then(() => {
          Alert.success('Successfully duplicated a site');

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
    searchValue,
    duplicate
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
    name: 'sitesRemoveMutation'
  }),
  graphql<Props, SitesDuplicateMutationResponse>(
    gql(mutations.sitesDuplicate),
    {
      name: 'sitesDuplicateMutation'
    }
  )
)(SitesContainer);
