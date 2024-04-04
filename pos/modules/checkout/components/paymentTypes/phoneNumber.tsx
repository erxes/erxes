import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, CornerDownLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

const formSchema = z.object({
  phone: z
    .string()
    .regex(new RegExp(/^\d{8}$/), "Зөв утасны дугаар оруулана уу")
    .min(8, {
      message: "Зөв утасны дугаар оруулана уу",
    }),
})

const PhoneNumber = ({
  loading,
  handleSubmit,
  _id,
  error,
}: {
  loading: boolean
  handleSubmit: (arg: { id: string; phone?: string }) => void
  _id: string
  error: string
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    handleSubmit({ id: _id, phone: values.phone })
  }

  return (
    <Form {...form}>
      <form className="max-w-xs w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Бүртгэлтэй утасны дугаар</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input placeholder="00000000" {...field} className="pr-12" />
                </FormControl>
                <Button
                  className="h-auto absolute inset-y-0 right-0 z-10"
                  variant="outline"
                >
                  {!loading && (
                    <CornerDownLeft className="h-4 w-4 -ml-1 mr-2" />
                  )}
                  Enter
                </Button>
              </div>
              {/* */}
              <FormMessage />
            </FormItem>
          )}
        />
        {!!error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Алдаа !</AlertTitle>
            <AlertDescription className="break-all">
              *{`${error}`}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  )
}

export default PhoneNumber
