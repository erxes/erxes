import { gql } from "@apollo/client"

const exm = gql`
  query ExmGet {
    exmGet {
      _id
      structure
      vision
    }
  }
`

export default {
  exm
}
