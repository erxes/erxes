import React, { useEffect } from 'react';
import { Alert, confirm } from 'modules/common/utils';
import Bulk from 'modules/common/components/Bulk';
import BookingList from '../components/BookingList';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations, queries } from '../graphql';
import { generatePaginationParams } from 'modules/common/utils/router';
import {
  BookingIntegrationsQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import { ArchiveIntegrationResponse } from 'modules/settings/integrations/types';
import { CountQueryResponse } from 'modules/leads/types';

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

  // tslint:disable-next-line: no-shadowed-variable
  const content = props => {
    return <BookingList {...updatedProps} {...props} />;
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
