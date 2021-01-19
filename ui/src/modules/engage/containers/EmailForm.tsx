import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { Alert, withProps } from '../../common/utils';
import EmailForm from '../components/EmailForm';
import { mutations, queries } from '../graphql';
import { EngageVerifiedEmailsQueryResponse, IEmailFormProps } from '../types';

type FinalProps = {
  engageVerifiedEmailsQuery: EngageVerifiedEmailsQueryResponse;
  engageSendTestEmail: any;
} & IEmailFormProps;

const EmailFormContainer = (props: FinalProps) => {
  const { engageSendTestEmail, engageVerifiedEmailsQuery } = props;

  const verifiedEmails = engageVerifiedEmailsQuery.engageVerifiedEmails || [];
  const error = engageVerifiedEmailsQuery.error;

  const sendTestEmail = ({ content, from, to, title }) => {
    if (!content) {
      return Alert.warning('Please fill email content');
    }
    if (!from) {
      return Alert.warning('Please choose from user');
    }
    if (!to) {
      return Alert.warning('Please fill destination email address');
    }

    engageSendTestEmail({ variables: { content, from, to, title } })
      .then(() => {
        Alert.success('Email has been sent');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    error: error && error.message,
    verifiedEmails,
    sendTestEmail
  };

  return <EmailForm {...updatedProps} />;
};

export default withProps<IEmailFormProps>(
  compose(
    graphql<IEmailFormProps, EngageVerifiedEmailsQueryResponse>(
      gql(queries.verifiedEmails),
      { name: 'engageVerifiedEmailsQuery' }
    ),
    graphql(gql(mutations.sendTestEmail), {
      name: 'engageSendTestEmail'
    })
  )(EmailFormContainer)
);
