import { gql } from "@apollo/client"

const slots = gql`
  query PoscSlots {
    poscSlots {
      _id
      code
      name
      option
      status
      isPreDates {
        dueDate
        _id
      }
    }
  }
`

const queries = { slots }
export default queries
