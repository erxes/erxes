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
// poscCustomers(searchValue: String!, type: String, perPage: Int, page: Int): [PosCustomer]
const poscCustomers = gql`
  query poscCustomers($searchValue: String!, $type: String) {
    poscCustomers(searchValue: $searchValue, type: $type) {
      _id
      code
      primaryPhone
      firstName
      primaryEmail
      lastName
    }
  }
`

const queries = { poscCustomerDetail, poscCustomers }
export default queries
