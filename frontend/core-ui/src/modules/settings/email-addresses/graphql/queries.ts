import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const EMAIL_ADDRESSES = gql`
  query EmailAddresses(
    $lane: String
    $suppressionReason: String
    $searchValue: String
    $emails: [String]
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    emailAddresses(
      lane: $lane
      suppressionReason: $suppressionReason
      searchValue: $searchValue
      emails: $emails
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        email
        lane
        lastSentAt
        lastDeliveredAt
        deliveredCount
        softBounceCount
        lastSoftBounceAt
        suppressedAt
        suppressionReason
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const EMAIL_ADDRESS_RELEASE = gql`
  mutation EmailAddressRelease($email: String!, $note: String!) {
    emailAddressRelease(email: $email, note: $note)
  }
`;
