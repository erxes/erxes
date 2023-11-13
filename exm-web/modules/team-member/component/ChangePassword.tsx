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

const ChangePassword = ({
  changePassword,
  loading,
  setOpen,
}: {
  changePassword: (params: {
    currentPassword: string
    newPassword: string
    confirmation: string
  }) => void
  loading: boolean
  setOpen: (open: boolean) => void
}) => {
  const FormSchema = z.object({
    currentPassword: z.string({
      required_error: "Please enter current password.",
    }),
    newPassword: z.string({
      required_error: "Please enter new password.",
    }),
    confirmation: z.string({
      required_error: "Please enter again new password.",
    }),
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {console.log("data", data)
    changePassword(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Re-type Password to confirm</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center items-center">
          <Button
            className="bg-[#BFBFBF] mr-6 font-bold uppercase"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="font-bold uppercase"
            loading={loading}
          >
            Change
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ChangePassword
