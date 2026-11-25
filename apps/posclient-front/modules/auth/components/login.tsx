"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import SyncConfig from "@/modules/settings/SyncConfig"
import { configAtom } from "@/store/config.store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtomValue } from "jotai"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { getEnv } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

const PASSWORD_REVEAL_TIMEOUT = 10000

const FormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .min(8, "Use at least 8 characters."),
})

export type LoginValues = z.infer<typeof FormSchema>

export function LoginForm({
  loading = false,
  error,
  login,
}: {
  loading?: boolean
  error?: string
  login: (values: LoginValues) => void
}) {
  const { NEXT_PUBLIC_SERVER_DOMAIN: serverDomain } = getEnv()
  const config = useAtomValue(configAtom)
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", password: "" },
  })
  const onSubmit = (values: LoginValues) => {
    if (loading) return

    setShowPassword(false)
    login(values)
  }

  useEffect(() => {
    if (!showPassword) return
    const timer = setTimeout(
      () => setShowPassword(false),
      PASSWORD_REVEAL_TIMEOUT
    )
    return () => clearTimeout(timer)
  }, [showPassword])

  const hasConfig = Boolean(config?.token)
  const inputClassName =
    "h-10 rounded-sm border-0 px-3 text-base shadow-xs placeholder:text-zinc-400 sm:h-7 sm:text-[13px] aria-invalid:shadow-focus-destructive"
  const actionClassName =
    "h-8 px-2 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"

  return (
    <div className="grid gap-5">
      {hasConfig ? (
        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[13px] leading-none font-medium text-foreground">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      className={inputClassName}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[13px] leading-none font-medium text-foreground">
                    Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        className={`${inputClassName} pr-9`}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-1 my-auto size-6 rounded-sm text-zinc-400 hover:bg-transparent hover:text-foreground sm:size-6"
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" className="size-[15px]" />
                      ) : (
                        <Eye aria-hidden="true" className="size-[15px]" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle aria-hidden="true" className="size-4" />
                <AlertDescription className="text-sm text-foreground">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              className="h-10 w-full rounded-md text-[13px] sm:h-8"
              loading={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Form>
      ) : (
        <p className="rounded-xl border bg-sidebar px-4 py-3 text-sm text-muted-foreground">
          Select a point of sale to sign in.
        </p>
      )}

      {(hasConfig || serverDomain) && (
        <div>
          <div className="flex flex-wrap justify-center gap-2">
            {hasConfig && (
              <SyncConfig
                configType="config"
                variant="ghost"
                className={`min-w-28 flex-1 ${actionClassName}`}
              >
                Sync config
              </SyncConfig>
            )}
            {serverDomain && (
              <Button
                Component={Link}
                variant="ghost"
                className={`min-w-28 flex-1 ${actionClassName}`}
                href={`${serverDomain}/settings/sales/pos`}
                target="_blank"
                rel="noopener noreferrer"
              >
                POS settings
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
