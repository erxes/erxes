import { gql } from "@apollo/client"

const users = gql`
  query PosUsers {
    posUsers {
      _id
      email
    }
  }
`

const report = gql`
  query DailyReport($posUserIds: [String], $posNumber: String) {
    dailyReport(posUserIds: $posUserIds, posNumber: $posNumber) {
      report
    }
  }
`

const queries = { users, report }

export default queries
