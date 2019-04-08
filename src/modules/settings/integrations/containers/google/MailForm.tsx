import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { MailForm } from '../../components/google';
import {
  IntegrationsQueryResponse,
  SendGmailMutationResponse,
  SendGmailMutationVariables
} from '../../types';

type Props = {
  refetchQueries: string[];
  contentType: string;
  contentTypeId: string;
  headerId?: string;
  threadId?: string;
  toEmail?: string;
  subject?: string;
  toEmails?: string[];
  closeModal?: () => void;
};

type FinalProps = {
  gmailIntegrationsQuery: IntegrationsQueryResponse;
} & Props &
  SendGmailMutationResponse;

const MailFormContainer = (props: FinalProps) => {
  const {
    integrationsSendGmail,
    contentType,
    contentTypeId,
    headerId,
    threadId,
    gmailIntegrationsQuery
  } = props;

  if (gmailIntegrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = gmailIntegrationsQuery.integrations || [];

  const send = (variables, callback: () => void) => {
    integrationsSendGmail({
      variables: {
        ...variables,
        headerId,
        threadId,
        cocType: contentType,
        cocId: contentTypeId
      }
    })
      .then(() => {
        if (callback) {
          callback();
        }
        Alert.success('Your email has been sent!');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return <MailForm {...props} send={send} integrations={integrations} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, SendGmailMutationResponse, SendGmailMutationVariables>(
      gql(mutations.integrationsSendGmail),
      {
        name: 'integrationsSendGmail',
        options: ({ refetchQueries }: { refetchQueries: string[] }) => ({
          refetchQueries
        })
      }
    ),
    graphql<Props, IntegrationsQueryResponse, { kind: string }>(
      gql(queries.integrations),
      {
        name: 'gmailIntegrationsQuery',
        options: () => {
          return {
            variables: {
              kind: 'gmail'
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    )
  )(MailFormContainer)
);
