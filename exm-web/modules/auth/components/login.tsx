"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { IHandleForgotPassword, IHandleLogin } from "../login"

const Login = ({
  loading,
  login,
  forgotPassword,
  type,
  setType,
}: {
  loading?: boolean
  login: IHandleLogin
  forgotPassword: IHandleForgotPassword
  type: string
  setType: (type: string) => void
}) => {
  const FormSchema =
    type === "login"
      ? z.object({
          email: z
            .string({
              required_error: "Please enter an email to login.",
            })
            .email(),
          password: z
            .string({
              required_error: "Please enter a password to login",
            })
            .min(8),
        })
      : z.object({
          email: z
            .string({
              required_error: "Please enter an email to reset password.",
            })
            .email(),
        })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log("type", type)
    if (type === "login") {
      login(data)
    }
    if (type === "forgotPassword") {
      console.log("onsubmit")
      forgotPassword(data)
    }
  }

  if (type === "forgotPassword") {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full font-bold uppercase"
            loading={loading}
          >
            Email Me The Instruction
          </Button>
          <Button
            onClick={() => setType("login")}
            className="w-full"
            loading={loading}
            variant="ghost"
            size="sm"
          >
            Sign in
          </Button>
        </form>
      </Form>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full font-bold uppercase"
          loading={loading}
        >
          Log in
        </Button>
        <Button
          onClick={() => setType("forgotPassword")}
          className="w-full"
          loading={loading}
          variant="ghost"
          size="sm"
        >
          Forgot Password
        </Button>
      </form>
    </Form>
  )
}

export default Login
