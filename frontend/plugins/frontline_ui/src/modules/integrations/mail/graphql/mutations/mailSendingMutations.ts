import { gql } from '@apollo/client';
import { MAIL_SENDING_ACCOUNT_FIELDS } from '../queries/mailSendingQueries';

export const MAIL_SENDING_ACCOUNT_ADD_MUTATION = gql`
  mutation mailSendingAccountAdd(
    $name: String!
    $provider: String
    $domain: String!
    $awsAccessKeyId: String
    $awsSecretAccessKey: String
    $awsRegion: String
    $sendgridApiKey: String
  ) {
    mailSendingAccountAdd(
      name: $name
      provider: $provider
      domain: $domain
      awsAccessKeyId: $awsAccessKeyId
      awsSecretAccessKey: $awsSecretAccessKey
      awsRegion: $awsRegion
      sendgridApiKey: $sendgridApiKey
    ) {
      ...MailSendingAccountFields
    }
  }
  ${MAIL_SENDING_ACCOUNT_FIELDS}
`;

export const MAIL_SENDING_ACCOUNT_VERIFY_MUTATION = gql`
  mutation mailSendingAccountVerify($_id: String!) {
    mailSendingAccountVerify(_id: $_id) {
      ...MailSendingAccountFields
    }
  }
  ${MAIL_SENDING_ACCOUNT_FIELDS}
`;

export const MAIL_SENDING_ACCOUNT_REMOVE_MUTATION = gql`
  mutation mailSendingAccountRemove($_id: String!) {
    mailSendingAccountRemove(_id: $_id)
  }
`;
