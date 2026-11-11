import { gql } from '@apollo/client';

export const MONGOLIAN_DEAL_PUT_RESPONSES = gql`
  query mongolianDealPutResponses($contentId: String!, $limit: Int) {
    putResponses(contentType: "deal", contentId: $contentId, limit: $limit) {
      list {
        _id
        id
        number
        date
        createdAt
        type
        state
        status
        message
        merchantTin
        customerTin
        customerName
        consumerNo
        lottery
        qrData
        receipts
        totalAmount
        totalVAT
        totalCityTax
      }
      totalCount
    }
  }
`;
