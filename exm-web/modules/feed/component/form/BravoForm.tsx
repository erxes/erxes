"use client"

import { useEffect } from "react"
import { queries } from "@/common/team/graphql"
import { useQuery } from "@apollo/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FacetedFilter } from "@/components/ui/faceted-filter"
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
import { Textarea } from "@/components/ui/textarea"

import useFeedMutation from "../../hooks/useFeedMutation"
import { IFeed } from "../../types"

const FormSchema = z.object({
  title: z.string({
    required_error: "Please enter an title",
  }),
  description: z.string().optional(),
  recipientIds: z.array(z.string()).optional(),
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

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { feedMutation, loading: mutationLoading } = useFeedMutation({
    callBack,
  })

  const { data: usersData, loading } = useQuery(queries.users)

  const { users } = usersData || {}

  useEffect(() => {
    let defaultValues = {} as any

    if (feed) {
      defaultValues = { ...feed }
    }

    form.reset({ ...defaultValues })
  }, [feed])

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    feedMutation(
      {
        title: data.title,
        description: data.description ? data.description : "",
        contentType: "bravo",
        recipientIds: data.recipientIds || [],
      },
      feed?._id || ""
    )
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create bravo</DialogTitle>
      </DialogHeader>

      {mutationLoading ? <LoadingPost /> : null}

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
                <FormLabel>Choose one</FormLabel>
                <FormControl>
                  {loading ? (
                    <Input disabled={true} placeholder="Loading..." />
                  ) : (
                    <FacetedFilter
                      options={(users || []).map((user: any) => ({
                        label: user?.details?.fullName || user.email,
                        value: user._id,
                      }))}
                      title="Users"
                      values={field.value}
                      onSelect={field.onChange}
                    />
                  )}
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
