import { gql } from '@apollo/client';


export const GET_COMPANY_DETAIL = gql`query CompanyDetail($id: String!) {
  companyDetail(_id: $id) {
    _id
    avatar
    code
    createdAt
    primaryEmail
    primaryName
    primaryPhone
    ownerId
    customers {
      _id
      avatar
      firstName
      lastName
      middleName
    }
    names
    emails
    owner {
      _id
      username
    }
    description
    businessType
  }
}`