import { gql } from "@apollo/client"

const ordersCheckCompany = gql`
  query ordersCheckCompany($registerNumber: String!) {
    ordersCheckCompany(registerNumber: $registerNumber)
  }
`

const queries = { ordersCheckCompany }

export default queries
