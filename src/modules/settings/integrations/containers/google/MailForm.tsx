import gql from 'graphql-tag';
import { ButtonMutate, Spinner } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { MailForm } from '../../components/google';
import { IntegrationsQueryResponse } from '../../types';

type Props = {
  integrationId?: string;
  refetchQueries?: string[];
  toEmail?: string;
  closeModal?: () => void;
};

type FinalProps = {
  gmailIntegrationsQuery: IntegrationsQueryResponse;
} & Props;

const MailFormContainer = (props: FinalProps) => {
  const { gmailIntegrationsQuery, refetchQueries, toEmail, closeModal } = props;

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
      />
    );
  };

  const updatedProps = {
    renderButton,
    integrations,
    toEmail,
    closeModal
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
