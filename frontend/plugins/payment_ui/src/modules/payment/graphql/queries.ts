import { gql } from '@apollo/client';

export const COUNTS = gql`
  query paymentsTotalCount($kind: String, $status: String) {
    paymentsTotalCount(kind: $kind, status: $status) {
      byKind
      total
      __typename
    }
  }
`;


export const PAYMENTS = gql`
query payments($status: String, $kind: String) {
  payments(status: $status, kind: $kind) {
    _id
    name
    kind
    status
    config
    createdAt
  }
}
`;

export const DISTRICTS = gql`
  query qpayGetDistricts($cityCode: String!) {
    qpayGetDistricts(cityCode: $cityCode)
  }
`;

export const INVOICES = gql`
query Invoices($kind: String, $status: String, $searchValue: String, $contentType: String, $contentTypeId: String, $limit: Int, $cursor: String, $direction: CURSOR_DIRECTION) {
  invoices(kind: $kind, status: $status, searchValue: $searchValue, contentType: $contentType, contentTypeId: $contentTypeId, limit: $limit, cursor: $cursor, direction: $direction) {
    list {
      _id
      amount
      contentType
      contentTypeId
      createdAt
      currency
      customer
      customerId
      customerType
      description
      invoiceNumber
      status
      transactions {
        amount
        createdAt
        status
        paymentKind
      }
    }
  }
}
`;
