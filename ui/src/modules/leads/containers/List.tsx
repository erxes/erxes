import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from 'modules/common/components/Bulk';
import { IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import { mutations as integrationMutations } from 'modules/settings/integrations/graphql/index';
import { ArchiveIntegrationResponse } from 'modules/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import routerUtils from '../../common/utils/router';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  CopyMutationResponse, LeadIntegrationsQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';


type Props = {
  queryParams: any;
};

type FinalProps = {
  integrationsQuery: LeadIntegrationsQueryResponse;
} & RemoveMutationResponse &
  ArchiveIntegrationResponse &
  IRouterProps &
  CopyMutationResponse &
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
    const { integrationsQuery } = this.props;

    integrationsQuery.refetch();
  };

  render() {
    const {
      integrationsQuery,
      removeMutation,
      copyMutation,
      archiveIntegration
    } = this.props;

    const integrations = integrationsQuery.integrations || [];

    const remove = (integrationId: string) => {
      const message =
        'If you remove a forms, then all related conversations, customers will also be removed. Are you sure?';

      confirm(message).then(() => {
        removeMutation({
          variables: { _id: integrationId }
        })
          .then(() => {
            // refresh queries
            this.refetch();

            Alert.success('You successfully deleted a forms.');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const archive = (integrationId: string, status: boolean) => {
      let message = `If you archive a forms, then you won't be able to see customers & conversations related to this forms anymore. Are you sure?`;
      let action = 'archived';

      if (!status) {
        message = 'You are going to unarchive this forms. Are you sure?';
        action = 'unarchived';
      }

      confirm(message).then(() => {
        archiveIntegration({ variables: { _id: integrationId, status } })
          .then(({ data }) => {
            const integration = data.integrationsArchive;

            if (integration) {
              Alert.success(`Forms has been ${action}.`);
            }

            this.refetch();
          })
          .catch((e: Error) => {
            Alert.error(e.message);
          });
      });
    };

    const copy = (integrationId: string) => {
      copyMutation({
        variables: { _id: integrationId }
      })
        .then(() => {
          // refresh queries
          this.refetch();

          Alert.success('You successfully copied a form.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }

    const updatedProps = {
      ...this.props,
      integrations,
      remove,
      loading: integrationsQuery.loading,
      archive,
      copy,
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
      LeadIntegrationsQueryResponse,
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
            kind: INTEGRATION_KINDS.LEAD,
            status: queryParams.status
          }
        };
      }
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
    ),
    graphql(gql(mutations.formCopy), {
      name: 'copyMutation'
    })
  )(ListContainer)
);
