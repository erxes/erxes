import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

/**
 * Only what the table renders. Bodies and raw provider responses can be large,
 * so they are left to the detail query.
 */
export const EMAIL_DELIVERIES = gql`
  query EmailDeliveries(
    $status: String
    $source: String
    $provider: String
    $searchValue: String
    $createdAtFrom: Date
    $createdAtTo: Date
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    emailDeliveries(
      status: $status
      source: $source
      provider: $provider
      searchValue: $searchValue
      createdAtFrom: $createdAtFrom
      createdAtTo: $createdAtTo
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        createdAt
        from
        toEmails
        subject
        provider
        status
        deliveryStatus
        source
        error
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const EMAIL_DELIVERY_DETAIL = gql`
  query EmailDeliveryDetail($id: String!) {
    emailDeliveryDetail(_id: $id) {
      _id
      createdAt
      updatedAt
      from
      toEmails
      ccEmails
      subject
      provider
      messageId
      providerResponse
      status
      sentAt
      error
      rejected
      source
      sourceId
      userId
      deliveryStatus
      deliveryStatusAt
      bounced
      complained
      opened
      clicked
    }
  }
`;
