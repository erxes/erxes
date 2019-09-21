import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { __, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import MailForm from '../../components/google/MailForm';
import { IntegrationsQueryResponse } from '../../types';

type Props = {
  integrationId?: string;
  refetchQueries?: string[];
  headerId?: string;
  threadId?: string;
  references?: string;
  fromEmail?: string;
  to?: any;
  cc?: any;
  bcc?: any;
  subject?: string;
  integrationEmail?: string;
  closeModal?: () => void;
};

type FinalProps = {
  gmailIntegrationsQuery: IntegrationsQueryResponse;
} & Props;

const MailFormContainer = (props: FinalProps) => {
  const {
    headerId,
    integrationId,
    threadId,
    subject,
    gmailIntegrationsQuery,
    refetchQueries,
    fromEmail,
    to,
    cc,
    bcc,
    integrationEmail,
    closeModal
  } = props;

  if (gmailIntegrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = gmailIntegrationsQuery.integrations || [];

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.integrationSendMail}
        variables={values}
        callback={callback}
        refetchQueries={refetchQueries}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage="You have successfully sent a email"
      >
        {__('Send')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    renderButton,
    integrations,
    integrationId,
    fromEmail,
    cc,
    bcc,
    to,
    closeModal,
    headerId,
    threadId,
    subject,
    integrationEmail
  };

  return <MailForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
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
