import { gql } from '@apollo/client';

export const IMAP_SEND_MAIL_MUTATION = gql`
  mutation imapSendMail(
    $integrationId: String
    $conversationId: String
    $subject: String!
    $body: String
    $to: [String]!
    $cc: [String]
    $bcc: [String]
    $from: String!
    $shouldResolve: Boolean
    $shouldOpen: Boolean
    $replyToMessageId: String
    $references: [String]
    $attachments: [JSON]
    $customerId: String
  ) {
    imapSendMail(
      integrationId: $integrationId
      conversationId: $conversationId
      subject: $subject
      body: $body
      to: $to
      cc: $cc
      bcc: $bcc
      from: $from
      shouldResolve: $shouldResolve
      shouldOpen: $shouldOpen
      replyToMessageId: $replyToMessageId
      references: $references
      attachments: $attachments
      customerId: $customerId
    )
  }
`;
