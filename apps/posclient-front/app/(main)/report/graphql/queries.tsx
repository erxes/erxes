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
  query DailyReport($posUserIds: [String], $dateType: String, $startDate: Date, $endDate: Date) {
    dailyReport(posUserIds: $posUserIds, dateType: $dateType, startDate: $startDate, endDate: $endDate) {
      report
    }
  }
`

const queries = { users, report }

export default queries
