import { gql } from "@apollo/client"

const poscCustomerDetail = gql`
  query poscCustomerDetail($_id: String!, $type: String) {
    poscCustomerDetail(_id: $_id, type: $type) {
      _id
      code
      primaryPhone
      firstName
      primaryEmail
      lastName
      __typename
    }
  }
`

const queries = { poscCustomerDetail }
export default queries
