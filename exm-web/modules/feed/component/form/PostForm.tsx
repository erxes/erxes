"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { XCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import Select from "react-select"
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
import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"

import useFeedMutation from "../../hooks/useFeedMutation"
import { useTeamMembers } from "../../hooks/useTeamMembers"
import { IFeed } from "../../types"
import Uploader from "./uploader/Uploader"

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
  departmentIds: z.array(z.string()).optional(),
  branchIds: z.array(z.string()).optional(),
  unitId: z.string().optional(),
})

const PostForm = ({
  feed,
  setOpen,
}: {
  feed?: IFeed
  setOpen: (open: boolean) => void
}) => {
  const [departmentIds, setDepartmentIds] = useState(feed?.departmentIds || [])
  const [branchIds, setBranchIds] = useState(feed?.branchIds || [])
  const [unitId, setUnitd] = useState(feed?.unitId || "")

  const [reload, setReload] = useState(false)

  const [images, setImage] = useState(feed?.images || [])
  const [attachments, setAttachments] = useState(feed?.attachments || [])
  const [unitSearchValue, setUnitsSearchvalue] = useState("")
  const [branchSearchValue, setBranchSearchvalue] = useState("")
  const [departmentSearchValue, seDepartmentSearchvalue] = useState("")
  const [success, setSuccess] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [attachmentUploading, setAttachmentUploading] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const callBack = (result: string) => {
    if (result === "success") {
      setAttachments([])
      setImage([])
      form.reset()
      setReload(false)
      setSuccess(true)

      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
      }, 1500)
    }
  }

  const { departmentOptions, branchOptions, unitOptions, loading } =
    useTeamMembers({
      departmentIds,
      branchIds,
      unitIds: [unitId],
      unitSearchValue,
      branchSearchValue,
      departmentSearchValue,
      reload,
    })

  const { feedMutation, loading: mutationLoading } = useFeedMutation({
    callBack,
  })

  const deleteAttachment = (index: number) => {
    const updated = [...attachments]

    updated.splice(index, 1)

    setAttachments(updated)
  }

  const deleteImage = (index: number) => {
    const updated = [...images]

    updated.splice(index, 1)

    setImage(updated)
  }

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
        contentType: "post",
        images,
        attachments,
        departmentIds,
        branchIds,
        unitId,
      },
      feed?._id || ""
    )
  }

  const onChangeMultiValue = (type: string, datas: any) => {
    const onchangeFunc = type === "department" ? setDepartmentIds : setBranchIds

    const ids = datas.map((data: any) => data.value)

    onchangeFunc(ids)
  }

  return (
    <DialogContent className="max-h-[80vh] overflow-auto">
      <DialogHeader>
        <DialogTitle>Create post</DialogTitle>
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
            name="departmentIds"
            render={() => (
              <FormItem>
                <FormLabel>Departments</FormLabel>
                <FormControl>
                  {loading && !reload && !seDepartmentSearchvalue ? (
                    <Input disabled={true} placeholder="Loading..." />
                  ) : (
                    <Select
                      onMenuClose={() => setReload(false)}
                      onMenuOpen={() => setReload(true)}
                      isMulti={true}
                      options={departmentOptions}
                      defaultValue={departmentOptions?.filter(
                        (departmentOption) =>
                          departmentIds.includes(departmentOption?.value)
                      )}
                      placeholder="Select departments"
                      isSearchable={true}
                      onInputChange={seDepartmentSearchvalue}
                      onChange={(data) =>
                        onChangeMultiValue("department", data)
                      }
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branchIds"
            render={() => (
              <FormItem>
                <FormLabel>Branches</FormLabel>
                <FormControl>
                  {loading && !reload && branchSearchValue ? (
                    <Input disabled={true} placeholder="Loading..." />
                  ) : (
                    <Select
                      onMenuClose={() => setReload(false)}
                      onMenuOpen={() => setReload(true)}
                      isMulti={true}
                      options={branchOptions}
                      defaultValue={branchOptions?.filter((branchOption) =>
                        branchIds?.includes(branchOption?.value)
                      )}
                      placeholder="Select branches"
                      isSearchable={true}
                      onInputChange={setBranchSearchvalue}
                      onChange={(data) => onChangeMultiValue("branch", data)}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitId"
            render={({}) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  {loading && !reload && unitSearchValue ? (
                    <Input disabled={true} placeholder="Loading..." />
                  ) : (
                    <Select
                      onMenuClose={() => setReload(false)}
                      onMenuOpen={() => setReload(true)}
                      isClearable={true}
                      options={unitOptions}
                      placeholder="Select units"
                      value={unitOptions?.filter(
                        (unitOption) => unitOption.value === unitId
                      )}
                      isSearchable={true}
                      onInputChange={setUnitsSearchvalue}
                      onChange={(data) => {
                        setUnitd(data?.value || "")
                      }}
                    />
                  )}
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

          <Uploader
            defaultFileList={attachments || []}
            onChange={setAttachments}
            setUploading={setAttachmentUploading}
          />

          {(attachments || []).map((attachment, index) => {
            return (
              <div
                key={index}
                className="flex items-center border-y text-sm font-semibold text-[#444] p-2.5 justify-between max-w-[445px] break-all"
              >
                <p className="max-w-[400px]">{attachment.name}</p>
                <XCircle size={18} onClick={() => deleteAttachment(index)} />
              </div>
            )
          })}

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

export default PostForm
