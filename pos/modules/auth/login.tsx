"use client"

import { useMutation } from "@apollo/client"

import { useToast } from "@/components/ui/use-toast"

import Login from "./components/login"
import { mutations } from "./graphql"

const LoginContainer = () => {
  const { toast } = useToast()
  const [login, { loading }] = useMutation(mutations.login, {
    onCompleted(data) {
      if (data.posLogin === "loggedIn") return (window.location.href = "/")
    },
    onError(error) {
      return toast({ description: error.message, variant: "destructive" })
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
