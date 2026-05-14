import { gql } from '@apollo/client';
const putResponses = gql`
  query PutResponses {
    putResponses {
      list {
        _id
        branchNo
        number
        contentType
        contentId
        totalAmount
        totalVAT
        totalCityTax
        districtCode
        merchantTin
        posNo
        customerTin
        customerName
        consumerNo
        type
        inactiveId
        invoiceId
        reportMonth
        data
        receipts
        payments
        easy
        getInformation
        sendInfo
        state
        createdAt
        modifiedAt
        userId
        id
        posId
        status
        message
        qrData
        lottery
        date
      }
    }
  }
`;

export const putResponseQueries = {
  putResponses,
};
