import { gql } from "@apollo/client"
import { queries as teamQueries } from "common/team/graphql"

const detailFields = teamQueries.detailFields
const allUsers = teamQueries.allUsers
const users = teamQueries.users

const userFields = `
  _id
  username
  email
  employeeId
  details {
    avatar
    fullName
    firstName
    lastName
    position
  }
  departments {
    title
  }
  branches {
    title
  }
`
const attachmentFields = `
  url
  name
  type
  size
  duration
`
const listParamsDef = `
  $page: Int
  $perPage: Int
  $startDate: Date
  $endDate: Date
  $userIds: [String]
  $branchIds: [String]
  $departmentIds: [String]
  $reportType: String
  $scheduleStatus: String
  $isCurrentUserAdmin: Boolean
  $searchValue: String
`

const listParamsValue = `
  page: $page
  perPage: $perPage
  startDate: $startDate
  endDate: $endDate
  userIds: $userIds
  branchIds: $branchIds
  departmentIds: $departmentIds
  reportType: $reportType
  scheduleStatus: $scheduleStatus
  isCurrentUserAdmin: $isCurrentUserAdmin
  searchValue: $searchValue
`

const requestsMain = gql`
  query requestsMain(${listParamsDef}) {
    requestsMain(${listParamsValue}) {
      list {
          _id
          startTime
          endTime
          reason
          explanation
          solved
          status
          user {
            ${userFields}
          }
          attachment{
            ${attachmentFields}
          }
          absenceTimeType
          requestDates
          totalHoursOfAbsence
          note
        }
        totalCount
  }
}
`
export default {
  requestsMain,
}
