"use client"

import { useState } from "react"
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import SelectUsers from "@/components/select/SelectUsers"

import { useChatId } from "../../hooks/useChatId"

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

export const ForwardForm = ({
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

  const [userIds, setUserIds] = useState([] as string[])

  if (loading) {
    return <>loading</>
  }

  if (loadingMutation) {
    return <>loading</>
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a chat</DialogTitle>
      </DialogHeader>

      <SelectUsers userIds={userIds} onChange={setUserIds} />
    </DialogContent>
  )
}
