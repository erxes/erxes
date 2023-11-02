"use client"

import { useMutation } from "@apollo/client"

import { useToast } from "@/components/ui/use-toast"

import ForgotPassword from "./components/forgotPassword"
import Login from "./components/login"
import { mutations } from "./graphql"

const LoginContainer = ({
  type,
  setType,
}: {
  type: string
  setType: (type: string) => void
}) => {
  const { toast } = useToast()

  const [login, { loading }] = useMutation(mutations.login, {
    onCompleted() {
      return (window.location.href = "/")
    },
    onError(error) {
      return toast({ description: error.message, variant: "destructive" })
    },
    refetchQueries: ["currentUser"],
  })

  const [forgotPassword, { loading: forgotPasswordLoading }] = useMutation(
    mutations.forgotPassword,
    {
      onCompleted() {
        return toast({
          description:
            "Further instructions have been sent to your e-mail address.",
        })
      },
      onError(error) {
        return toast({ description: error.message, variant: "destructive" })
      },
    }
  )

  const handleLogin: IHandleLogin = ({ email, password }) => {
    login({ variables: { email, password } })
  }

  const handleForgotPassword: IHandleForgotPassword = ({ email }) => {
    forgotPassword({ variables: { email } })
  }

  if (type === "forgotPassword") {
    return (
      <ForgotPassword
        loading={loading || forgotPasswordLoading}
        forgotPassword={handleForgotPassword}
        setType={setType}
      />
    )
  }

  return (
    <Login
      loading={loading || forgotPasswordLoading}
      login={handleLogin}
      setType={setType}
    />
  )
}

export type IHandleLogin = (params: { email: string; password: string }) => void
export type IHandleForgotPassword = (params: { email: string }) => void

export default LoginContainer
