import { gql } from "@apollo/client"
import { coverFields } from "./fields"

const addEditParamDefs = `
    $beginDate: Date
    $description: String
    $details: JSON
    $endDate: Date
    $status: String
    $userId: String
`

const addEditParams = `
    beginDate: $beginDate
    description: $description
    details: $details
    endDate: $endDate
    status: $status
    userId: $userId
`

const coversAdd = gql`
  mutation CoversAdd(
    ${addEditParamDefs}
  ) {
    coversAdd(
     ${addEditParams}
    ) {
      ${coverFields}
    }
  }
`

const coversEdit = gql`
  mutation CoversEdit(
    $id: String!
    ${addEditParamDefs}
  ) {
    coversEdit(
      _id: $id
      ${addEditParams}
    ) {
      ${coverFields}
    }
  }
`

const coversConfirm = gql`
  mutation CoversConfirm($_id: String!) {
    coversConfirm(_id: $_id) {
      ${coverFields}
    }
  }
`

const coversDelete = gql`
  mutation CoversRemove($_id: String!) {
    coversRemove(_id: $_id)
  }
`

const terminalResultSave = gql`
  mutation PosclientCoverTerminalResultSave(
    $id: String!
    $resultId: String!
    $bank: String!
    $response: String
  ) {
    posclientCoverTerminalResultSave(
      _id: $id
      resultId: $resultId
      bank: $bank
      response: $response
    ) {
      ${coverFields}
    }
  }
`

export const mutations = {
  coversAdd,
  coversEdit,
  coversConfirm,
  coversDelete,
  terminalResultSave,
}
