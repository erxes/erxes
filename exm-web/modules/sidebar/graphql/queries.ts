import { gql } from "@apollo/client"

const getUnreadChatCount = gql`
  query getUnreadChatCount {
    getUnreadChatCount
  }
`

export default { getUnreadChatCount }
