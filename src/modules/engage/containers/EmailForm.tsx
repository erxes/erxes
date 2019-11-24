import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import EmailForm from '../components/EmailForm';
import { queries } from '../graphql';
import { EngageVerifiedEmailsQueryResponse, IEmailFormProps } from '../types';

type FinalProps = {
  engageVerifiedEmailsQuery: EngageVerifiedEmailsQueryResponse;
} & IEmailFormProps;

const EmailFormContainer = (props: FinalProps) => {
  const { engageVerifiedEmailsQuery } = props;

  const verifiedEmails = engageVerifiedEmailsQuery.engageVerifiedEmails || [];
  const error = engageVerifiedEmailsQuery.error;

  const updatedProps = {
    ...props,
    error: error && error.message,
    verifiedEmails
  };

  return <EmailForm {...updatedProps} />;
};

export default withProps<IEmailFormProps>(
  compose(
    graphql<IEmailFormProps, EngageVerifiedEmailsQueryResponse>(
      gql(queries.verifiedEmails),
      { name: 'engageVerifiedEmailsQuery' }
    )
  )(EmailFormContainer)
);
