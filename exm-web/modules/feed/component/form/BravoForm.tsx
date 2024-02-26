"use client"

import { useEffect, useState } from "react"
import { IAttachment } from "@/modules/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Select from "react-select"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import Loader from "@/components/ui/loader"
import LoadingPost from "@/components/ui/loadingPost"
import SuccessPost from "@/components/ui/successPost"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import SelectUsers from "@/components/select/SelectUsers"

import useFeedMutation from "../../hooks/useFeedMutation"
import { useTeamMembers } from "../../hooks/useTeamMembers"
import { IFeed } from "../../types"
import AttachmentBgSection from "./AttachmentBgSection"

const FormSchema = z.object({
  description: z
    .string({
      required_error: "Please enter an description",
    })
    .refine((val) => val.trim().length !== 0, {
      message: "Please enter an description",
    }),
  recipientIds: z.array(z.object({})).optional(),
})

const BravoForm = ({
  feed,
  setOpen,
  tab,
  changeTab,
}: {
  feed?: IFeed
  setOpen: (open: boolean) => void
  tab: string
  changeTab: (tab: string) => void
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const [recipientIds, setRecipientIds] = useState(feed?.recipientIds || [])
  const [success, setSuccess] = useState(false)
  const [images, setImage] = useState(feed?.images || [])
  const [attachments, setAttachments] = useState(feed?.attachments || [])
  const [department, setDepartment] = useState(
    feed?.recipientIds || ([] as string[])
  )
  const [uploading, setUploading] = useState(false)
  const [departmentSearchValue, setDepartmentSearchValue] = useState("")
  const [background, setBackground] = useState(feed?.background || {} as IAttachment)

  const { departmentOptions, loading } = useTeamMembers({
    departmentSearchValue,
  })

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

  const onChangeMultiValue = (datas: any) => {
    const ids = datas.map((data: any) => data.value)
    setDepartment(ids)
  }

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (
      (!recipientIds || recipientIds.length === 0) &&
      (!department || department.length === 0)
    ) {
      return toast({
        description: "Please choose users or department",
        variant: "destructive",
      })
    } else {
      feedMutation(
        {
          title: "title",
          description: data.description ? data.description : "",
          contentType: "bravo",
          recipientIds: recipientIds.concat(department),
          images,
          background,
          attachments,
        },
        feed?._id || ""
      )
    }
  }

  const content = () => {
    if (tab === "share") {
      return (
        <div className="flex flex-col gap-4 h-full relative">
          <b className="text-center">
            Choose person who would you like to post
          </b>
          <FormField
            control={form.control}
            name="recipientIds"
            render={({ field }) => (
              <FormItem className="max-w-[500px] w-full mx-auto ">
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
          {loading ? (
            <Loader />
          ) : (
            <div className="max-w-[500px] w-full mx-auto ">
              <Select
                isMulti={true}
                options={departmentOptions}
                defaultValue={departmentOptions?.filter((departmentOption) =>
                  department.includes(departmentOption?.value)
                )}
                placeholder="Choose department"
                isSearchable={true}
                onInputChange={setDepartmentSearchValue}
                onChange={(data) => onChangeMultiValue(data)}
              />
            </div>
          )}
          <div className="pt-6 border-t border-[#F2F4F7] mt-auto absolute bottom-[-20px] flex justify-between w-full">
            <Button
              className="font-semibold rounded-lg bg-white text-black border border-light hover:bg-white float-right w-[180px]"
              onClick={() => changeTab("info")}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="font-semibold rounded-lg bg-primary float-right w-[180px]"
              disabled={uploading}
            >
              Post
            </Button>
          </div>
        </div>
      )
    }

    return (
      <>
        <div className="flex justify-center gap-6 mb-6 h-[calc(100%-50px)]">
          <div className="max-w-[566px] border border-exm rounded-md w-full h-full">
            <AttachmentBgSection
              uploading={uploading}
              images={images}
              setImage={setImage}
              attachments={attachments}
              setAttachments={setAttachments}
              setUploading={setUploading}
              setBackground={setBackground}
              background={background}
            />
          </div>
          <div className="border border-exm rounded-md max-w-[566px] !w-full">
            <div className="px-4 py-3 border-b-2 border-exm">Bravo</div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="h-[calc(100%-46px)]">
                  <FormControl>
                    <Textarea
                      placeholder="Write a bravo"
                      {...field}
                      defaultValue={feed?.description || ""}
                      className="p-3 border-none max-w-[566px] w-full !h-[100%] !max-h-[unset]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="pt-6 border-t border-[#F2F4F7]">
          <Button
            className="font-semibold rounded-lg bg-primary float-right w-[180px]"
            disabled={uploading}
            onClick={() => changeTab("share")}
          >
            Next
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      {mutationLoading ? <LoadingPost /> : null}
      {success ? <SuccessPost /> : null}

      <Form {...form}>
        <form
          className="space-y-3 h-[calc(80vh-8rem)]"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {content()}
        </form>
      </Form>
    </>
  )
}

export default BravoForm
