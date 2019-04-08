import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router';
import { Lead } from '../../components/lead';
import { mutations } from '../../graphql';
import {
  IntegrationsQueryResponse,
  MessengerAppsAddLeadMutationResponse
} from '../../types';
import { integrationsListParams } from '../utils';

type Props = {
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
  leadIntegrationsQuery: IntegrationsQueryResponse;
} & IRouterProps &
  Props &
  MessengerAppsAddLeadMutationResponse;

class LeadContainer extends React.Component<FinalProps> {
  render() {
    const {
      integrationsQuery,
      leadIntegrationsQuery,
      saveMutation,
      history
    } = this.props;

    if (integrationsQuery.loading && leadIntegrationsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const integrations = integrationsQuery.integrations || [];
    const leads = leadIntegrationsQuery.integrations || [];

    const save = (variables, callback) => {
      saveMutation({ variables })
        .then(() => {
          Alert.success('You successfully added a lead');
          callback();
          history.push('/settings/integrations');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      integrations,
      leads,
      save
    };

    return <Lead {...updatedProps} />;
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
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'leadIntegrationsQuery',
      options: ({ queryParams }) => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            ...integrationsListParams(queryParams || {}),
            kind: 'form'
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<Props, MessengerAppsAddLeadMutationResponse>(
      gql(mutations.messengerAppsAddLead),
      {
        name: 'saveMutation',
        options: () => {
          return {
            refetchQueries: [
              {
                query: gql(queries.messengerApps),
                variables: { kind: 'lead' }
              },
              {
                query: gql(queries.messengerAppsCount),
                variables: { kind: 'lead' }
              }
            ]
          };
        }
      }
    ),
    withApollo
  )(withRouter<FinalProps>(LeadContainer))
);
