import { gql } from "@apollo/client"

const chatUnreadCountChanged = gql`
  subscription chatUnreadCountChanged($userId: String!) {
    chatUnreadCountChanged(userId: $userId)
  }
`

export default { chatUnreadCountChanged }
