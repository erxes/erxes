"use client"

import Link from "next/link"
import SyncConfig from "@/modules/settings/SyncConfig"
import { configAtom } from "@/store/config.store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom } from "jotai"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { getEnv } from "@/lib/utils"
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

import ChooseConfig from "../chooseConfig"
import { IHandleLogin } from "../login"

const FormSchema = z.object({
  email: z
    .string({
      required_error: "Нэвтрэхийн тулд имэйл оруулна уу.",
    })
    .email(),
  password: z
    .string({
      required_error: "Нэвтрэхийн тулд нууц үг оруулна уу",
    })
    .min(8, { message: "Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой" }),
})

const Login = ({
  loading,
  login,
}: {
  loading?: boolean
  login: IHandleLogin
}) => {
  const env = getEnv()
  const [config] = useAtom(configAtom)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const onSubmit = (data: z.infer<typeof FormSchema>) => login(data)

  return (
    <>
      <ChooseConfig />
      {config?.token && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="cashier@erxes.io" {...field} />
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
          </form>

          <div className="flex items-center justify-between">
            <SyncConfig configType="config" variant="link" className="">
              Sync Config
            </SyncConfig>
            <Button
              Component={Link}
              variant="link"
              href={`${env.NEXT_PUBLIC_SERVER_DOMAIN}/settings/sales/pos`}
              target="_blank"
            >
              Go to Settings
            </Button>
          </div>
        </Form>
      )}
    </>
  )
}

export default Login
