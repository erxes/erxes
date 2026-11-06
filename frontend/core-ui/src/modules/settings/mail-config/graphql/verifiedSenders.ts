import { gql } from '@apollo/client';

export const SENDER_OPTIONS = gql`
  query EmailSenderOptions($scope: String) {
    emailSenderOptions(scope: $scope) {
      provider
      supportsSenderVerification
      supportsDynamicSender
      verifiedDomains
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

export const FROM_DOMAIN_CHECK = gql`
  query EmailFromDomainCheck($scope: String) {
    emailSenderOptions(scope: $scope) {
      fromDomain {
        domain
        region
        state
        error
        dnsRecords {
          type
          host
          data
          valid
        }
        otherVerifiedDomains
        listError
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
