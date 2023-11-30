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

import { IHandleLogin } from "../login"

const Login = ({
  loading,
  forgotPasswordLoading,
  login,
  setType,
}: {
  loading?: boolean
  forgotPasswordLoading?: boolean
  login: IHandleLogin
  setType: (type: string) => void
}) => {
  const FormSchema = z.object({
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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    login(data)
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
          loading={forgotPasswordLoading}
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
