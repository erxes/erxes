import { gql } from '@apollo/client';

/**
 * Only the fields a sender picker needs. The generic `configs` query would also
 * carry the org's provider credentials, which has no business on these screens.
 */
export const SENDER_OPTIONS = gql`
  query EmailSenderOptions {
    emailSenderOptions {
      provider
      supportsSenderVerification
      supportsDynamicSender
      defaultSenderEmail
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
    $address: String
    $city: String
    $country: String
  ) {
    engageMessageVerifyEmail(
      email: $email
      name: $name
      replyTo: $replyTo
      address: $address
      city: $city
      country: $country
    )
  }
`;

export const REMOVE_VERIFIED_SENDER = gql`
  mutation RemoveVerifiedSender($email: String!) {
    engageMessageRemoveVerifiedEmail(email: $email)
  }
`;
