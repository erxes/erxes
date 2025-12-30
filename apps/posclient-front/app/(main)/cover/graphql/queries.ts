import { gql } from "@apollo/client"

const covers = gql`
  query Covers($startDate: Date, $endDate: Date, $userId: String) {
    covers(startDate: $startDate, endDate: $endDate, userId: $userId) {
      _id
      posToken
      status
      beginDate
      endDate
      description
      userId
      createdAt
      createdBy
      modifiedAt
      modifiedBy
      note
      user {
        email
      }
      createdUser {
        email
      }
      modifiedUser {
        email
      }
    }
  }
`
const coverAmounts = gql`
  query CoverAmounts($id: String, $endDate: Date) {
    coverAmounts(_id: $id, endDate: $endDate)
  }
`

const details = `
   details {
     _id
     paidDetail
     paidSummary {
        _id
        amount
        kind
        kindOfVal
        value
      }
      paidType
  }
  `
const commonFields = `
  beginDate
  endDate
  description
`
const coverDetail = gql`
  query CoverDetail($id: String!) {
    coverDetail(_id: $id) {
      _id
      ${commonFields}
      ${details}
    }
  }
`

const recieptDetail = gql`
  query CoverDetail($id: String!) {
    coverDetail(_id: $id) {
      createdAt
      modifiedAt
      note
      createdUser {
        email
      }
      modifiedUser {
        email
      }
      ${commonFields}
      ${details}
    }
  }
`

const queries = { covers, coverAmounts, coverDetail, recieptDetail }

export default queries
