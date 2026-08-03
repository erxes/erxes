import { gql } from '@apollo/client';

export const SENDER_OPTIONS = gql`
  query EmailSenderOptions($scope: String) {
    emailSenderOptions(scope: $scope) {
      provider
      supportsSenderVerification
      supportsDynamicSender
      defaultSenderEmail
      alignedFrom
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
  mutation VerifySender($email: String!, $name: String, $scope: String) {
    engageMessageVerifyEmail(email: $email, name: $name, scope: $scope)
  }
`;

export const REMOVE_VERIFIED_SENDER = gql`
  mutation RemoveVerifiedSender($email: String!, $scope: String) {
    engageMessageRemoveVerifiedEmail(email: $email, scope: $scope)
  }
`;
