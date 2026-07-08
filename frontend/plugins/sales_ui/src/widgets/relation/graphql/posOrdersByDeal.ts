import { gql } from '@apollo/client';

export const POS_ORDERS_BY_DEAL = gql`
  query PosOrdersByDeal($dealId: String) {
    posOrders(dealId: $dealId) {
      _id
      number
      paidDate
      totalAmount
      cashAmount
      mobileAmount
      paidAmounts
      posName
    }
  }
`;

export const INVOICE_DETAIL_BY_CONTENT = gql`
  query InvoiceDetailByContent($contentType: String!, $contentTypeId: String!) {
    invoiceDetailByContent(
      contentType: $contentType
      contentTypeId: $contentTypeId
    ) {
      _id
      transactions {
        _id
        paymentKind
        amount
        status
      }
    }
  }
`;
