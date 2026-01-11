import { gql } from "@apollo/client"

const login = gql`
  mutation posLogin($email: String!, $password: String!) {
    posLogin(email: $email, password: $password)
  }
`

const configsFetch = gql`
  mutation posConfigsFetch($token: String!) {
    posConfigsFetch(token: $token) {
      _id
    }
  }
`

const chooseConfig = gql`
  mutation posChooseConfig($token: String!) {
    posChooseConfig(token: $token)
  }
`

const mutations = {
  login,
  configsFetch,
  chooseConfig,
}

export default mutations
