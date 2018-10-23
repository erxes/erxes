import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { MailForm } from '../../components/google';

type Props = {
  refetchQueries: string[];
  contentType: string;
  contentTypeId: string;
  toEmail?: string;
  toEmails?: string[];
  gmailIntegrationsQuery: any;
  setAttachmentPreview?: (data: string | null) => void;
  attachmentPreview: { name: string; data: string; type: string };
  closeModal?: () => void;
  integrationsSendGmail: (
    params: {
      variables: {
        cc?: string;
        bcc?: string;
        toEmails?: string;
        subject?: string;
        body: string;
        integrationId?: string;
      };
    }
  ) => Promise<any>;
};

const MailFormContainer = (props: Props) => {
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

export default compose(
  graphql(gql(mutations.integrationsSendGmail), {
    name: 'integrationsSendGmail',
    options: ({ refetchQueries }: { refetchQueries: string[] }) => ({
      refetchQueries
    })
  }),
  graphql(gql(queries.integrations), {
    name: 'gmailIntegrationsQuery',
    options: () => {
      return {
        variables: {
          kind: 'gmail'
        },
        fetchPolicy: 'network-only'
      };
    }
  })
)(MailFormContainer);
