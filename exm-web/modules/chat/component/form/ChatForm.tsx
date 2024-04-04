"use client"

import { useEffect, useState } from "react"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Loader from "@/components/ui/loader"
import SelectUsers from "@/components/select/SelectUsers"

import { useChatId } from "../../hooks/useChatId"
import useChatsMutation from "../../hooks/useChatsMutation"

dayjs.extend(relativeTime)

const FormSchema = z
  .object({
    name: z.string().optional(),
    userIds: z.array(z.object({})).refine((val) => val.length !== 0, {
      message: "Please choose users",
    }),
  })
  .refine(
    ({ userIds, name }) => {
      if (userIds.length > 1 && (!name || name.trim().length === 0)) {
        return false
      }
      return true
    },
    {
      message: "Please enter group chat name",
      path: ["name"],
    }
  )

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

  const { loading, loadingMutation, setChatUser, startGroupChat, chatId } =
    useChatId({
      refetch,
    })

  // const { chatForward } = useChatsMutation({
  //   callBack: (result: string) => {
  //     return null
  //   },
  // })

  const [userIds, setUserIds] = useState([] as string[])
  const [message, setMessage] = useState("")

  if (loading || loadingMutation) {
    return <Loader />
  }

  // useEffect(() => {
  //   if(chatId) {
  //     console.log(chatId, "effect")
  //   }
  //   // chatForward({
  //   //   id: userIds.length === 1 ? userIds[0] : chatId,
  //   //   type: userIds.length === 1 ? "direct" : "group",
  //   //   content: message,
  //   // })
  // }, [chatId])

  const handleInputChange = (e: any) => {
    setMessage(e.target.value)
  }

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (userIds.length === 1) {
      setChatUser(userIds[0])
      setUserIds([])
      setOpen(false)
      form.reset()
    }

    if (data.userIds && data.userIds?.length > 1) {
      startGroupChat(data?.name || "", userIds)
      setUserIds([])
      setOpen(false)
      form.reset()
    }
  }

  return (
    <DialogContent className="h-full right-0 left-[unset] translate-x-[0] translate-y-[0] top-0 !rounded-none p-0 flex flex-col">
      <DialogHeader className="p-4 border-b border-exm h-fit">
        <DialogTitle>New Message</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          className="space-y-3 h-full justify-between flex flex-col pb-4 px-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="gap-3 flex flex-col">
            <label className="font-bold">To*</label>
            <FormField
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SelectUsers
                      userIds={userIds}
                      onChange={setUserIds}
                      field={field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {userIds && userIds.length > 1 ? (
              <>
                <label className="font-bold">Group chat name*</label>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="sm:rounded-lg"
                          placeholder="Chat name"
                          {...field}
                          defaultValue={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            {/* <label className="font-bold">Message*</label>
            <textarea
              value={message}
              onChange={handleInputChange}
              autoComplete="off"
              className="outline-none w-full h-auto bg-transparent resize-none scrollbar-hide border border-[#D0D5DD] p-2 rounded-lg h-[120px]"
              placeholder="Type your message"
              rows={1}
            /> */}
          </div>
          <Button
            type="submit"
            className="font-semibold w-full sm:rounded-lg bg-primary"
          >
            Create
          </Button>
        </form>
      </Form>
    </DialogContent>
  )
}
