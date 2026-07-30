import { gql } from '@apollo/client';

/**
 * Only the fields a sender picker needs. The generic `configs` query would also
 * carry the org's provider credentials, which has no business on these screens.
 */
export const SENDER_OPTIONS = gql`
  query EmailSenderOptions($scope: String) {
    emailSenderOptions(scope: $scope) {
      provider
      supportsSenderVerification
      supportsDynamicSender
      defaultSenderEmail
      sameAsMailConfig
      senders {
        id
        type
        value
        name
        status
      }
    }
  }
`;

export const VERIFY_SENDER = gql`
  mutation VerifySender(
    $email: String!
    $name: String
    $replyTo: String
    $scope: String
  ) {
    engageMessageVerifyEmail(
      email: $email
      name: $name
      replyTo: $replyTo
      scope: $scope
    )
  }
`;

export const REMOVE_VERIFIED_SENDER = gql`
  mutation RemoveVerifiedSender($email: String!, $scope: String) {
    engageMessageRemoveVerifiedEmail(email: $email, scope: $scope)
  }
`;
