"use client"

import { useRouter } from "next/navigation"
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
import { useToast } from "@/components/ui/use-toast"

import { mutations } from "./graphql"

const FormSchema = z.object({
  token: z
    .string({
      required_error: "Please enter a token to init.",
    })
    .min(8),
})

const ConfigsFetch = () => {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const [posConfigsFetch, { loading }] = useMutation(mutations.configsFetch, {
    onCompleted() {
      router.push("/login")
    },
    onError(error) {
      return toast({ description: error.message, variant: "destructive" })
    },
    refetchQueries: ["currentConfig"],
  })
  const onSubmit = (data: z.infer<typeof FormSchema>) =>
    posConfigsFetch({ variables: data })

  return (
    <Form {...form}>
      <form className="w-80 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
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
          className="w-full font-bold uppercase"
          loading={loading}
        >
          Init
        </Button>
      </form>
    </Form>
  )
}

export default ConfigsFetch
