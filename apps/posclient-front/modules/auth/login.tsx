"use client"

import { useState } from "react"
import { useMutation } from "@apollo/client"

import { LoginForm, type LoginValues } from "./components/login"
import { mutations } from "./graphql"

export function LoginContainer() {
  const [error, setError] = useState<string>()
  const [login, { loading }] = useMutation(mutations.login, {
    onError({ message }) {
      setError(message)
    },
    refetchQueries: ["posCurrentUser"],
    awaitRefetchQueries: true,
  })

  const handleLogin = (values: LoginValues) => {
    setError(undefined)
    void login({ variables: values })
  }

  return <LoginForm loading={loading} error={error} login={handleLogin} />
}
