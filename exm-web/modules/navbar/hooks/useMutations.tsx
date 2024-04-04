import { useMutation } from "@apollo/client"

import { mutations } from "../graphql"

const useMutations = () => {
  const [logoutMutation, { loading: logoutLoading }] = useMutation(
    mutations.logout
  )

  const logout = () => {
    logoutMutation().then(() => {
      window.location.href = "/"
    })
  }

  return {
    logout,
    loading: logoutLoading,
  }
}

export default useMutations
