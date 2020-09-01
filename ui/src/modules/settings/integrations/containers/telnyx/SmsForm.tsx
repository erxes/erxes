import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { Alert, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import {
  IntegrationsQueryResponse,
  SendSmsMutationResponse
} from 'modules/settings/integrations/types';
import * as React from 'react';
import { graphql } from 'react-apollo';
import SmsForm from '../../components/telnyx/SmsForm';

type Props = {
  closeModal: () => void;
  primaryPhone: string;
};

type FinalProps = {
  sendSmsMutation: SendSmsMutationResponse;
  integrationsFetchApiQuery: any;
  integrationsQuery: IntegrationsQueryResponse;
} & Props;

const SmsFormContainer = (props: FinalProps) => {
  const {
    integrationsQuery,
    integrationsFetchApiQuery,
    closeModal,
    sendSmsMutation
  } = props;

  if (integrationsFetchApiQuery.loading || integrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations || [];
  const externalIntegrations =
    integrationsFetchApiQuery.integrationsFetchApi || [];

  const mappedIntegrations: any[] = [];

  for (const e of externalIntegrations) {
    const local = integrations.find(i => i._id === e.erxesApiId);

    if (local) {
      mappedIntegrations.push({
        _id: local._id,
        name: local.name,
        phoneNumber: e.telnyxPhoneNumber,
        isActive: local.isActive
      });
    }
  }

  const sendSms = (integrationId: string, content: string, to: string) => {
    if (!integrationId) {
      return Alert.warning('Please choose phone number');
    }
    if (!content) {
      return Alert.warning('Please type sms text');
    }
    if (!to) {
      return Alert.warning('Customer or company does not have primary phone');
    }

    sendSmsMutation({
      variables: { integrationId, content, to }
    })
      .then(({ data }) => {
        const { status } = data.integrationsSendSms;

        if (status === 'ok') {
          Alert.success('SMS successfully sent');
        }

        closeModal();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    sendSms,
    integrations: mappedIntegrations,
    closeModal
  };

  return <SmsForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.fetchApi), {
      name: 'integrationsFetchApiQuery',
      options: () => ({
        variables: { path: '/integrations', params: { kind: 'telnyx' } },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: () => {
        return {
          variables: { kind: 'telnyx' },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<Props>(gql(mutations.integrationsSendSms), {
      name: 'sendSmsMutation'
    })
  )(SmsFormContainer)
);
