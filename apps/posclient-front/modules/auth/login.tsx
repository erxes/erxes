"use client"

import { useMutation } from "@apollo/client"

import Login from "./components/login"
import { mutations } from "./graphql"
import { onError } from '@/components/ui/use-toast'

const LoginContainer = () => {
  const [login, { loading }] = useMutation(mutations.login, {
    onError({ message }) {
      onError(message)
    },
    refetchQueries: ["posCurrentUser"],
  })

  const handleLogin: IHandleLogin = ({ email, password }) => {
    login({ variables: { email, password } })
  }

  return <Login loading={loading} login={handleLogin} />
}

export type IHandleLogin = (params: { email: string; password: string }) => void

export default LoginContainer
