import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { MailForm } from '../../components/common';

type Props = {
  contentType: string;
  contentTypeId: string;
  customerEmail?: string;
  gmailIntegrationsQuery: any;
  setAttachmentPreview?: (data: string | null) => void;
  attachmentPreview: { name: string; data: string; type: string };
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
    customerEmail,
    gmailIntegrationsQuery
  } = props;

  if (gmailIntegrationsQuery.loading) {
    return <Spinner objective />;
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
      customerEmail={customerEmail || ''}
      {...props}
    />
  );
};

const options = () => {
  return {
    refetchQueries: ['activityLogsCustomer']
  };
};

export default compose(
  graphql(gql(mutations.integrationsSendGmail), {
    name: 'integrationsSendGmail',
    options
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
