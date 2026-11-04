import { gql } from "@apollo/client"
import { coverFields } from "./fields"

const covers = gql`
  query Covers($startDate: Date, $endDate: Date, $userId: String) {
    covers(startDate: $startDate, endDate: $endDate, userId: $userId) {
      _id
      posToken
      status
      beginDate
      endDate
      description
      details {
        _id
        paidType
        terminalResults {
          _id
          bank
          response
          createdAt
        }
      }
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

const coverDetail = gql`
  query CoverDetail($id: String!) {
    coverDetail(_id: $id) {
      ${coverFields}
    }
  }
`

const recieptDetail = gql`
  query PosclientCoverReceiptDetail($id: String!) {
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
      ${coverFields}
    }
  }
`

export const queries = { covers, coverAmounts, coverDetail, recieptDetail }
