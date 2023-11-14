"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Select from "react-select"
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
import LoadingPost from "@/components/ui/loadingPost"
import SuccessPost from "@/components/ui/successPost"
import { Textarea } from "@/components/ui/textarea"
import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"

import useFeedMutation from "../../hooks/useFeedMutation"
import { IFeed } from "../../types"
import FormAttachments from "./FormAttachments"
import FormImages from "./FormImages"
import Uploader from "./uploader/Uploader"

const FormSchema = z.object({
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
  const [category, setCategory] = useState(feed?.category || "")
  const [success, setSuccess] = useState(false)
  const [attachments, setAttachments] = useState(feed?.attachments || [])

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
  const [attachmentUploading, setAttachmentUploading] = useState(false)

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
        title: "title",
        description: data.description ? data.description : "",
        contentType: "publicHoliday",
        category,
        createdAt: data.createdAt,
        images,
        attachments,
      },
      feed?._id || ""
    )
  }

  return (
    <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
      <DialogHeader>
        <DialogTitle>Create public holiday</DialogTitle>
      </DialogHeader>

      {mutationLoading ? <LoadingPost /> : null}
      {success ? <SuccessPost /> : null}

      <Form {...form}>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="About this holiday"
                    {...field}
                    defaultValue={feed?.description || ""}
                    className="p-0 border-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormAttachments
            attachments={attachments || []}
            setAttachments={setAttachments}
          />
          <FormImages images={images} setImage={setImage} />{" "}
          <Select
            isMulti={false}
            options={[
              { label: "Ceremony", value: "ceremony" },
              { label: "Birthday", value: "birthday" },
              { label: "Public holiday", value: "publicHoliday" },
            ]}
            placeholder="Choose category"
            isSearchable={true}
            onChange={(data) => setCategory(data?.value || "")}
          />
          <FormField
            control={form.control}
            name="createdAt"
            render={({ field }) => (
              <FormItem>
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
          <div className="flex items-center border rounded-lg px-2 border-[#cccccc] justify-between">
            <p className="text-[#444]">Add attachments</p>
            <div className="flex">
              <Uploader
                defaultFileList={images || []}
                onChange={setImage}
                type={"image"}
                icon={true}
                iconSize={20}
                setUploading={setImageUploading}
              />

              <Uploader
                defaultFileList={attachments || []}
                onChange={setAttachments}
                icon={true}
                iconSize={20}
                setUploading={setAttachmentUploading}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="font-semibold w-full rounded-full"
            disabled={imageUploading || attachmentUploading}
          >
            Post
          </Button>
        </form>
      </Form>
    </DialogContent>
  )
}

export default HolidayForm
