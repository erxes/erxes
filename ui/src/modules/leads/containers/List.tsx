import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from 'modules/common/components/Bulk';
import { IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import { mutations as integrationMutations } from 'modules/settings/integrations/graphql/index';
import { ArchiveIntegrationResponse } from 'modules/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import routerUtils from '../../common/utils/router';
import { TagsQueryResponse } from '../../tags/types';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  CountQueryResponse,
  LeadIntegrationsQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  integrationsTotalCountQuery: CountQueryResponse;
  integrationsQuery: LeadIntegrationsQueryResponse;
  tagsQuery: TagsQueryResponse;
} & RemoveMutationResponse &
  ArchiveIntegrationResponse &
  IRouterProps &
  Props;

class ListContainer extends React.Component<FinalProps> {
  componentDidMount() {
    const { history } = this.props;

    const shouldRefetchList = routerUtils.getParam(history, 'popUpRefetchList');

    if (shouldRefetchList) {
      this.refetch();
    }
  }

  refetch = () => {
    const { integrationsQuery, integrationsTotalCountQuery } = this.props;

    integrationsQuery.refetch();
    integrationsTotalCountQuery.refetch();
  };

  render() {
    const {
      integrationsQuery,
      integrationsTotalCountQuery,
      tagsQuery,
      removeMutation,
      archiveIntegration
    } = this.props;

    const counts = integrationsTotalCountQuery.integrationsTotalCount || {
      byKind: {}
    };
    const totalCount = counts.byKind.lead || 0;
    const tagsCount = counts.byTag || {};

    const integrations = integrationsQuery.integrations || [];

    const remove = (integrationId: string) => {
      const message =
        'If you remove a pop ups, then all related conversations, customers will also be removed. Are you sure?';

      confirm(message).then(() => {
        removeMutation({
          variables: { _id: integrationId }
        })
          .then(() => {
            // refresh queries
            this.refetch();

            Alert.success('You successfully deleted a pop ups.');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const archive = (integrationId: string, status: boolean) => {
      let message = `If you archive a pop ups, then you won't be able to see customers & conversations related to this pop ups anymore. Are you sure?`;
      let action = 'archived';

      if (!status) {
        message = 'You are going to unarchive this pop ups. Are you sure?';
        action = 'unarchived';
      }

      confirm(message).then(() => {
        archiveIntegration({ variables: { _id: integrationId, status } })
          .then(({ data }) => {
            const integration = data.integrationsArchive;

            if (integration) {
              Alert.success(`Pop ups has been ${action}.`);
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
      integrations,
      remove,
      loading: integrationsQuery.loading,
      totalCount,
      tagsCount,
      tags: tagsQuery.tags || [],
      archive
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
      LeadIntegrationsQueryResponse,
      { page?: number; perPage?: number; tag?: string; kind?: string }
    >(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            ...generatePaginationParams(queryParams),
            tag: queryParams.tag,
            kind: 'lead'
          }
        };
      }
    }),
    graphql<Props, CountQueryResponse>(gql(queries.integrationsTotalCount), {
      name: 'integrationsTotalCountQuery'
    }),
    graphql<Props, TagsQueryResponse, { type: string }>(gql(queries.tags), {
      name: 'tagsQuery',
      options: () => ({
        variables: {
          type: 'integration'
        }
      })
    }),
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.integrationRemove),
      {
        name: 'removeMutation'
      }
    ),
    graphql<Props, ArchiveIntegrationResponse>(
      gql(integrationMutations.integrationsArchive),
      {
        name: 'archiveIntegration'
      }
    )
  )(ListContainer)
);
