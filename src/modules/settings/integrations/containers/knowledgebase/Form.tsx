import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { queries as kbQueries } from 'modules/knowledgeBase/graphql';
import { TopicsQueryResponse } from 'modules/knowledgeBase/types';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router';
import { KnowledgeBase } from '../../components/knowledgebase';
import { mutations } from '../../graphql';
import {
  IntegrationsQueryResponse,
  MessengerAppsAddKnowledgebaseMutationResponse
} from '../../types';
import { integrationsListParams } from '../utils';

type Props = {
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
  knowledgeBaseTopicsQuery: TopicsQueryResponse;
} & IRouterProps &
  Props &
  MessengerAppsAddKnowledgebaseMutationResponse;

class KnowledgeBaseContainer extends React.Component<FinalProps> {
  render() {
    const {
      integrationsQuery,
      knowledgeBaseTopicsQuery,
      saveMutation,
      history
    } = this.props;

    if (integrationsQuery.loading && knowledgeBaseTopicsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const integrations = integrationsQuery.integrations || [];
    const topics = knowledgeBaseTopicsQuery.knowledgeBaseTopics || [];

    const save = (variables, callback) => {
      saveMutation({ variables })
        .then(() => {
          Alert.success('Congrats');
          callback();
          history.push('/settings/integrations');
        })
        .catch(e => {
          Alert.error(e.message);
          callback();
        });
    };

    const updatedProps = {
      ...this.props,
      integrations,
      topics,
      save
    };

    return <KnowledgeBase {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: ({ queryParams }) => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            ...integrationsListParams(queryParams || {}),
            kind: 'messenger'
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<Props, TopicsQueryResponse>(gql(kbQueries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopicsQuery'
    }),
    graphql<Props, MessengerAppsAddKnowledgebaseMutationResponse>(
      gql(mutations.messengerAppsAddKnowledgebase),
      {
        name: 'saveMutation',
        options: () => {
          return {
            refetchQueries: [
              {
                query: gql(queries.messengerApps),
                variables: { kind: 'knowledgebase' }
              },
              {
                query: gql(queries.messengerAppsCount),
                variables: { kind: 'knowledgebase' }
              }
            ]
          };
        }
      }
    ),
    withApollo
  )(withRouter<FinalProps>(KnowledgeBaseContainer))
);
