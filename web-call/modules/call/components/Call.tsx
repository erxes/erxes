import * as z from "zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

type Props = {
  loading?: boolean
  setPhoneNumber: (phone: string) => void
}

const Call = ({ loading = false, setPhoneNumber }: Props) => {
  const FormSchema = z.object({
    phone: z
      .string({
        required_error: "Please enter a phone number to call.",
      })
      .min(8, "Phone number must be at least 8 characters")
      .refine((value) => !isNaN(Number(value)), {
        message: "Phone number must be a valid number",
      }),
  })
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setPhoneNumber(data.phone)
  }

  return (
    <div>
      <h2 className="text-[#673FBD] text-3xl font-bold mb-4">{"Welcome!"}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Таны утасны дугаар</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Утасны дугаараа оруулна уу"
                    {...field}
                    type="number"
                  />
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
            Үргэлжлүүлэх
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Call
