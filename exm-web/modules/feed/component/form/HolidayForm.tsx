"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
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
import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"

import useFeedMutation from "../../hooks/useFeedMutation"
import { IFeed } from "../../types"
import Uploader from "./uploader/Uploader"

const FormSchema = z.object({
  title: z
    .string({
      required_error: "Please enter an title",
    })
    .refine((val) => val.length !== 0, {
      message: "Please enter an title",
    }),
  description: z
    .string({
      required_error: "Please enter an description",
    })
    .refine((val) => val.length !== 0, {
      message: "Please enter an description",
    }),
  createdAt: z.date(),
})

const HolidayForm = ({
  feed,
  setOpen,
}: {
  feed?: IFeed
  setOpen: (open: boolean) => void
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const [images, setImage] = useState(feed?.images || [])
  const [success, setSuccess] = useState(false)

  const callBack = (result: string) => {
    if (result === "success") {
      form.reset()
      setImage([])
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
  const [imageUploading, setImageUploading] = useState(false)

  useEffect(() => {
    let defaultValues = {} as any

    if (feed) {
      defaultValues = { ...feed }

      defaultValues.createdAt = new Date(defaultValues.createdAt || "")
    }

    form.reset({ ...defaultValues })
  }, [feed])

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    feedMutation(
      {
        title: data.title,
        description: data.description ? data.description : "",
        contentType: "publicHoliday",
        createdAt: data.createdAt,
        images,
      },
      feed?._id || ""
    )
  }

  const deleteImage = (index: number) => {
    const updated = [...images]

    updated.splice(index, 1)

    setImage(updated)
  }

  return (
    <DialogContent className="max-h-[80vh] overflow-auto">
      <DialogHeader>
        <DialogTitle>Create public holiday</DialogTitle>
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
            name="createdAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Start Date</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    className="w-full"
                    fromDate={new Date()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Uploader
            defaultFileList={images || []}
            onChange={setImage}
            type={"image"}
            setUploading={setImageUploading}
          />
          {images && images.length > 0 && (
            <AttachmentWithPreview
              images={images}
              className="mt-2"
              deleteImage={deleteImage}
            />
          )}

          <Button
            type="submit"
            className="font-semibold w-full rounded-full"
            disabled={imageUploading}
          >
            Post
          </Button>
        </form>
      </Form>
    </DialogContent>
  )
}

export default HolidayForm
