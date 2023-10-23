"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import LoadingPost from "@/components/ui/loadingPost"
import SuccessPost from "@/components/ui/successPost"
import { Textarea } from "@/components/ui/textarea"
import SelectUsers from "@/components/select/SelectUsers"

import useFeedMutation from "../../hooks/useFeedMutation"
import { IFeed } from "../../types"

const FormSchema = z.object({
  title: z
    .string({
      required_error: "Please enter an title",
    })
    .refine((val) => val.trim().length !== 0, {
      message: "Please enter an title",
    }),
  description: z
    .string({
      required_error: "Please enter an description",
    })
    .refine((val) => val.trim().length !== 0, {
      message: "Please enter an description",
    }),
  recipientIds: z.array(z.object({})).refine((val) => val.length !== 0, {
    message: "Please choose users",
  }),
})

const BravoForm = ({
  feed,
  setOpen,
}: {
  feed?: IFeed
  setOpen: (open: boolean) => void
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const [recipientIds, setRecipientIds] = useState(feed?.recipientIds || [])
  const [success, setSuccess] = useState(false)

  const callBack = (result: string) => {
    if (result === "success") {
      form.reset()
      setSuccess(true)

      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
      }, 1500)
    }
  }

  const { feedMutation, loading: mutationLoading } = useFeedMutation({
    callBack,
  })

  useEffect(() => {
    let defaultValues = {} as any

    if (feed) {
      defaultValues = { ...feed }

      defaultValues.recipientIds = feed.recipientIds ? [{}] : []
    }

    form.reset({ ...defaultValues })
  }, [feed])

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    feedMutation(
      {
        title: data.title,
        description: data.description ? data.description : "",
        contentType: "bravo",
        recipientIds,
      },
      feed?._id || ""
    )
  }

  return (
    <DialogContent className="max-h-[80vh] overflow-auto">
      <DialogHeader>
        <DialogTitle>Create bravo</DialogTitle>
      </DialogHeader>

      {mutationLoading ? <LoadingPost /> : null}
      {success ? <SuccessPost /> : null}

      <Form {...form}>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="title"
                    {...field}
                    defaultValue={feed?.title || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="description"
                    {...field}
                    defaultValue={feed?.description || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recipientIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select users</FormLabel>
                <FormControl>
                  <SelectUsers
                    userIds={recipientIds}
                    onChange={setRecipientIds}
                    field={field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="font-semibold w-full rounded-full">
            Post
          </Button>
        </form>
      </Form>
    </DialogContent>
  )
}

export default BravoForm
