"use client"

import { useEffect, useState } from "react"
import Uploader from "@/modules/feed/component/form/uploader/Uploader"
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
import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"

import useChatsMutation from "../../hooks/useChatsMutation"
import { IChat } from "../../types"

const FormSchema = z.object({
  name: z
    .string({ required_error: "Please enter group chat name" })
    .refine((val) => val.trim().length !== 0, {
      message: "Please enter group chat name",
    }),
})

export const GroupChatAction = ({
  chat,
  setOpen,
}: {
  chat: IChat
  setOpen: (open: boolean) => void
}) => {
  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { chatEdit, loading } = useChatsMutation({
    callBack,
  })

  const [featuredImage, setFeaturedImage] = useState(chat?.featuredImage || [])

  const [imageUploading, setImageUploading] = useState(false)

  const deleteImage = (index: number) => {
    const updated = [...featuredImage]

    updated.splice(index, 1)

    setFeaturedImage(updated)
  }

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    chatEdit(chat._id, data.name, featuredImage)

    if (!loading) {
      setOpen(false)
      form.reset()
    }
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  useEffect(() => {
    let defaultValues = {} as any

    if (chat) {
      defaultValues = { ...chat }
    }
    form.reset({ ...defaultValues })
  }, [chat])

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Chat edit</DialogTitle>
      </DialogHeader>

      {loading ? <LoadingPost text="Creating chat" /> : null}
      <Form {...form}>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group chat Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="name"
                    defaultValue={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {featuredImage && featuredImage.length === 0 && (
            <Uploader
              defaultFileList={featuredImage || []}
              onChange={setFeaturedImage}
              type={"image"}
              setUploading={setImageUploading}
            />
          )}

          {featuredImage && featuredImage.length > 0 && (
            <AttachmentWithPreview
              images={featuredImage}
              className="mt-2"
              deleteImage={deleteImage}
            />
          )}

          <Button
            type="submit"
            className="font-semibold w-full rounded-full"
            disabled={imageUploading}
          >
            Update
          </Button>
        </form>
      </Form>
    </DialogContent>
  )
}
