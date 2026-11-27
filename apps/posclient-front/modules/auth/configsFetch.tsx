"use client"

import { useMutation } from "@apollo/client"
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
import { toast } from "@/components/ui/use-toast"

import { mutations } from "./graphql"

const FormSchema = z.object({
  token: z
    .string({
      required_error: "Please enter a token to init.",
    })
    .min(8),
})

const ConfigsFetch = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const [posConfigsFetch, { loading }] = useMutation(mutations.configsFetch, {
    onError(error) {
      return toast({ description: error.message, variant: "destructive" })
    },
    refetchQueries: ["currentConfig"],
  })
  const onSubmit = (data: z.infer<typeof FormSchema>) =>
    posConfigsFetch({ variables: data })

  return (
    <div className="flex h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-8 shadow-xl">
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Input placeholder="token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              loading={loading}
            >
              Init
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default ConfigsFetch
