import { gql } from '@apollo/client';

export const MAIL_SEND_MAIL_MUTATION = gql`
  mutation mailSendMail(
    $integrationId: String
    $conversationId: String
    $subject: String!
    $body: String
    $to: [String]!
    $cc: [String]
    $bcc: [String]
    $shouldResolve: Boolean
    $shouldOpen: Boolean
    $replyToMessageId: String
    $references: [String]
    $attachments: [JSON]
    $customerId: String
  ) {
    mailSendMail(
      integrationId: $integrationId
      conversationId: $conversationId
      subject: $subject
      body: $body
      to: $to
      cc: $cc
      bcc: $bcc
      shouldResolve: $shouldResolve
      shouldOpen: $shouldOpen
      replyToMessageId: $replyToMessageId
      references: $references
      attachments: $attachments
      customerId: $customerId
    )
  }
`;

export const MAIL_MESSAGE_RETRY_MUTATION = gql`
  mutation mailMessageRetry($_id: String!) {
    mailMessageRetry(_id: $_id)
  }
`;

export const MAIL_CHECK_CONNECTION_MUTATION = gql`
  mutation mailCheckConnection {
    mailCheckConnection {
      ok
      tenant
      endpoint
      error
    }
  }
`;

export const MAIL_DRAFT_SAVE_MUTATION = gql`
  mutation mailDraftSave($_id: String!, $subject: String, $body: String!) {
    mailDraftSave(_id: $_id, subject: $subject, body: $body) {
      _id
      subject
      body
      status
    }
  }
`;

export const MAIL_DRAFT_APPROVE_MUTATION = gql`
  mutation mailDraftApprove($_id: String!) {
    mailDraftApprove(_id: $_id)
  }
`;

export const MAIL_DRAFT_REMOVE_MUTATION = gql`
  mutation mailDraftRemove($_id: String!) {
    mailDraftRemove(_id: $_id) {
      _id
    }
  }
`;
