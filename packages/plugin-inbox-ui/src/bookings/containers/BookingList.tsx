import * as compose from 'lodash.flowright';

import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  BookingIntegrationsQueryResponse,
  RemoveMutationResponse
} from '../types';
import React, { useEffect } from 'react';
import { mutations, queries } from '../graphql';

import { ArchiveIntegrationResponse } from '@erxes/ui-inbox/src/settings/integrations/types';
import BookingList from '../components/BookingList';
import Bulk from '@erxes/ui/src/components/Bulk';
import { CountQueryResponse } from '@erxes/ui-leads/src/types';
import { INTEGRATION_KINDS } from '@erxes/ui/src/constants/integrations';
import { MutationVariables as RemoveMutationVariables } from '@erxes/ui/src/types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  queryParams: any;
};

type FinalProps = {
  integrationsTotalCountQuery: CountQueryResponse;
  integrationsQuery: BookingIntegrationsQueryResponse;
} & RemoveMutationResponse &
  ArchiveIntegrationResponse &
  Props;

function BookingListContainer(props: FinalProps) {
  useEffect(() => {
    refetch();
  });

  const {
    removeMutation,
    integrationsTotalCountQuery,
    archiveIntegration,
    integrationsQuery
  } = props;

  const integrations = integrationsQuery.integrations || [];

  const counts = integrationsTotalCountQuery
    ? integrationsTotalCountQuery.integrationsTotalCount
    : null;

  const totalCount = (counts && counts.total) || 0;

  const remove = (integrationId: string) => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: integrationId }
      })
        .then(() => {
          // refresh queries
          refetch();

          Alert.success('You successfully deleted a booking.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const archive = (integrationId: string, status: boolean) => {
    let message = `If you archive this booking, the live booking on your website or erxes messenger will no longer be visible. But you can still see the contacts and submissions you've received.`;
    let action = 'archived';

    if (!status) {
      message = 'You are going to unarchive this booking. Are you sure?';
      action = 'unarchived';
    }

    confirm(message).then(() => {
      archiveIntegration({ variables: { _id: integrationId, status } })
        .then(({ data }) => {
          const integration = data.integrationsArchive;

          if (integration) {
            Alert.success(`Form has been ${action}.`);
          }

          refetch();
        })
        .catch((e: Error) => {
          Alert.error(e.message);
        });
    });
  };

  const refetch = () => {
    integrationsQuery.refetch();
    integrationsTotalCountQuery.refetch();
  };

  const updatedProps = {
    ...props,
    loading: integrationsQuery.loading,
    refetch,
    remove,
    counts,
    totalCount,
    archive,
    integrations
  };

  const content = bulkProps => {
    return <BookingList {...updatedProps} {...bulkProps} />;
  };

  return <Bulk content={content} refetch={refetch} />;
}

export default compose(
  graphql<
    Props,
    BookingIntegrationsQueryResponse,
    {
      page?: number;
      perPage?: number;
      tag?: string;
      kind?: string;
      brand?: string;
      status?: string;
    }
  >(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: ({ queryParams }) => {
      return {
        variables: {
          ...generatePaginationParams(queryParams),
          tag: queryParams.tag,
          brandId: queryParams.brand,
          kind: INTEGRATION_KINDS.BOOKING,
          status: queryParams.status,
          sortField: queryParams.sortField,
          sortDirection: queryParams.sortDirection
            ? parseInt(queryParams.sortDirection, 10)
            : undefined
        }
      };
    }
  }),
  graphql<{}, ArchiveIntegrationResponse>(gql(mutations.integrationsArchive), {
    name: 'archiveIntegration'
  }),
  graphql<Props, CountQueryResponse>(gql(queries.integrationsTotalCount), {
    name: 'integrationsTotalCountQuery',
    options: ({ queryParams }) => ({
      variables: {
        kind: INTEGRATION_KINDS.BOOKING,
        tag: queryParams.tag,
        brandId: queryParams.brand,
        status: queryParams.status
      }
    })
  }),
  graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
    gql(mutations.integrationRemove),
    {
      name: 'removeMutation'
    }
  )
)(BookingListContainer);
