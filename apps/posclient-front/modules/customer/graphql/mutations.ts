import { gql } from "@apollo/client"

const customerFields = `
  _id
  code
  primaryPhone
  firstName
  primaryEmail
  lastName
`

const poscCustomersAdd = gql`
  mutation poscCustomersAdd($doc: JSON!) {
    poscCustomersAdd(doc: $doc) {
      customer {
        ${customerFields}
      }
      duplicate {
        ${customerFields}
      }
    }
  }
`

const mutations = { poscCustomersAdd }
export default mutations
