"use client"

import { queries } from "@/common/team/graphql"
import { useQuery } from "@apollo/client"
import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
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

import { useChatId } from "../../hooks/useChatId"

dayjs.extend(relativeTime)

const FormSchema = z.object({
  name: z.string().optional(),
  userIds: z.array(z.string()).optional(),
})

export const ChatForm = ({
  setOpen,
  refetch,
}: {
  setOpen: (open: boolean) => void
  refetch: () => void
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const { loading, loadingMutation, setChatUser, startGroupChat } = useChatId({
    refetch,
  })

  const { data: usersData, loading: loadingUser } = useQuery(queries.users)
  const { users } = usersData || {}

  if (loading) {
    return <>loading</>
  }

  if (loadingMutation) {
    return <>loading</>
  }

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (data.userIds?.length === 1) {
      setChatUser(data?.userIds[0])
      setOpen(false)
    }

    if (data.userIds && data.userIds?.length > 1) {
      startGroupChat(data?.name || "", data.userIds)
      setOpen(false)
    }
  }

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a chat</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose one</FormLabel>
                  <FormControl>
                    {loadingUser ? (
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

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group chat Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name"
                      {...field}
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="font-semibold w-full rounded-full">
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </>
  )
}
