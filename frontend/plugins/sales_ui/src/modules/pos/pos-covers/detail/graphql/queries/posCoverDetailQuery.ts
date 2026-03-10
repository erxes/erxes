import { gql } from '@apollo/client';

export const POS_COVER_DETAIL_QUERY = gql`
  query PosCoverDetail($id: String) {
    posCoverDetail(_id: $id) {
      _id
      posToken
      status
      beginDate
      endDate
      description
      userId
      note
      posName
      createdAt
      createdUser {
        email
      }
      totalAmount
      cashAmount
      mobileAmount
      paidAmounts {
        type
        amount
      }
    }
  }
`;
