import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IAttachmentPreview } from '../../../../common/types';
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
  toEmail?: string;
  toEmails?: string[];
  setAttachmentPreview?: (data: IAttachmentPreview) => void;
  attachmentPreview: { name: string; data: string; type: string };
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
    toEmail,
    gmailIntegrationsQuery
  } = props;

  if (gmailIntegrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = gmailIntegrationsQuery.integrations || [];

  const save = variables => {
    integrationsSendGmail({
      variables: {
        ...variables,
        cocType: contentType,
        cocId: contentTypeId
      }
    })
      .then(() => {
        Alert.success('Congrats! Your email sent successfully!');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <MailForm
      save={save}
      integrations={integrations}
      toEmail={toEmail || ''}
      {...props}
    />
  );
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
