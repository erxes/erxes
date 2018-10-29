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
  closeModal?: () => void;
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
  leadsQuery: IntegrationsQueryResponse;
} & IRouterProps &
  Props &
  MessengerAppsAddLeadMutationResponse;

class LeadContainer extends React.Component<FinalProps> {
  render() {
    const { integrationsQuery, leadsQuery, saveMutation, history } = this.props;

    if (integrationsQuery.loading && leadsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const integrations = integrationsQuery.integrations || [];
    const leads = leadsQuery.integrations || [];

    const save = variables => {
      saveMutation({ variables })
        .then(() => {
          Alert.success('Congrats');
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
      name: 'leadsQuery',
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
      { name: 'saveMutation' }
    ),
    withApollo
  )(withRouter<FinalProps>(LeadContainer))
);
