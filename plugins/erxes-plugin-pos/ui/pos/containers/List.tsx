import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps, Bulk, router } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  ArchiveIntegrationResponse,
  CountQueryResponse,
  IRouterProps,
  PosIntegrationsQueryResponse,
  PosListQueryResponse,
  RemoveMutationResponse
} from '../../types';

import { queries, mutations } from '../graphql';
import List from '../components/List';

type Props = {
  queryParams: any;
};

type FinalProps = {
  posListQuery: PosListQueryResponse;
  integrationsTotalCountQuery: CountQueryResponse;
} & RemoveMutationResponse &
  ArchiveIntegrationResponse &
  IRouterProps &
  Props;

class ListContainer extends React.Component<FinalProps> {
  componentDidMount() {
    const { history } = this.props;

    const shouldRefetchList = router.getParam(history, 'refetchList');

    if (shouldRefetchList) {
      this.refetch();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.queryParams.page !== prevProps.queryParams.page) {
      this.props.posListQuery.refetch();
    }
  }

  refetch = () => {
    const { posListQuery } = this.props;

    posListQuery.refetch();
  };

  render() {
    const {
      posListQuery,
      integrationsTotalCountQuery,
      removeMutation,
      archiveIntegration
    } = this.props;

    const posList = posListQuery.posList || [];

    const counts = integrationsTotalCountQuery
      ? integrationsTotalCountQuery.integrationsTotalCount
      : null;

    const totalCount = (counts && counts.total) || 0;

    const remove = (integrationId: string) => {
      const message = 'Are you sure?';

      confirm(message).then(() => {
        removeMutation({
          variables: { _id: integrationId }
        })
          .then(() => {
            // refresh queries
            this.refetch();

            Alert.success('You successfully deleted a pos.');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const archive = (integrationId: string, status: boolean) => {
      let message = `Are you sure ?`;
      let action = 'archived';

      if (!status) {
        message = 'You are going to unarchive this pos. Are you sure?';
        action = 'unarchived';
      }

      confirm(message).then(() => {
        archiveIntegration({ variables: { _id: integrationId, status } })
          .then(({ data }) => {
            const integration = data.integrationsArchive;

            if (integration) {
              Alert.success(`Form has been ${action}.`);
            }

            this.refetch();
          })
          .catch((e: Error) => {
            Alert.error(e.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      posList,
      counts,
      totalCount,
      remove,
      loading: posListQuery.loading,
      archive,
      refetch: this.refetch
    };

    const content = props => {
      return <List {...updatedProps} {...props} />;
    };

    return <Bulk content={content} refetch={this.refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      PosListQueryResponse,
      {
        page?: number;
        perPage?: number;
        tag?: string;
        kind?: string;
        brand?: string;
        status?: string;
      }
    >(gql(queries.posList), {
      name: 'posListQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            ...router.generatePaginationParams(queryParams || {}),
            tag: queryParams.tag,
            brandId: queryParams.brand,
            kind: 'pos',
            status: queryParams.status,
            sortField: queryParams.sortField,
            sortDirection: queryParams.sortDirection
              ? parseInt(queryParams.sortDirection, 10)
              : undefined
          }
        };
      }
    }),
    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.integrationRemove),
      {
        name: 'removeMutation'
      }
    ),
    graphql<Props, ArchiveIntegrationResponse>(
      gql(mutations.integrationsArchive),
      {
        name: 'archiveIntegration'
      }
    ),
    graphql<Props, CountQueryResponse>(gql(queries.integrationsTotalCount), {
      name: 'integrationsTotalCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          kind: 'pos',
          tag: queryParams.tag,
          brandId: queryParams.brand,
          status: queryParams.status
        }
      })
    })
  )(ListContainer)
);
