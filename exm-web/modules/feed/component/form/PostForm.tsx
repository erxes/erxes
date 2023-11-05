"use client"

import { useEffect, useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtomValue } from "jotai"
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
import Image from "@/components/ui/image"
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
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
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
        title: "title",
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

  const renderImages = () => {
    if (!images || images.length === 0) {
      return null
    }

    return (
      <div className="w-[462px] h-[462px] flex flex-wrap overflow-hidden relative">
        {images.map((image, index) => {
          const length = images.length
          let width
          if (length === 1 || length === 2) {
            width = "w-full"
          }
          if (length === 3) {
            if (index === 2) {
              width = "w-full"
            } else {
              width = "w-[227px]"
            }
          }
          if (length === 4 || length > 4) {
            width = "w-[227px]"
          }

          if (index > 3) {
            return null
          }console.log("index", index / 2, image)
          return (
            <Image
              key={index}
              alt="image"
              src={image.url || ""}
              width={500}
              height={500}
              className={`overflow-hidden rounded-lg object-cover ${width} ${
                length !== 1 ? "h-[227px]" : "h-full"
              } ${
                length !== 1 && length !== 2 && index % 2 === 0 && "mr-2"
              } mb-2`}
            />
          )
        })}
        {images.length > 4 && (
          <div className="text-white bg-black/50 w-[227px] h-[223px] absolute bottom-0 right-0 rounded-lg flex items-center justify-center text-[30px]">
            + {images.length - 4}
          </div>
        )}
      </div>
    )
  }

  return (
    <DialogContent className="max-h-[80vh] overflow-auto">
      <DialogHeader>
        <DialogTitle>Create post</DialogTitle>
      </DialogHeader>

      {mutationLoading ? <LoadingPost /> : null}

      {success ? <SuccessPost /> : null}

      <div className="flex items-center">
        <Image
          src={currentUser?.details?.avatar || "/avatar-colored.svg"}
          alt="User Profile"
          width={100}
          height={100}
          className="w-10 h-10 rounded-full object-cover border border-primary"
        />
        <div className="ml-3">
          <div className="text-sm font-bold text-gray-700 mb-1">
            {currentUser?.details?.fullName ||
              currentUser?.username ||
              currentUser?.email}
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Write a post"
                    {...field}
                    defaultValue={feed?.description || ""}
                    className="p-0 border-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(attachments || []).map((attachment, index) => {
            return (
              <div
                key={index}
                className="flex items-center bg-primary-light text-sm font-medium text-white attachment-shadow px-2.5 py-[5px] justify-between w-full rounded-lg rounded-tr-none"
              >
                <p className="max-w-[400px]">{attachment.name}</p>
                <XCircle size={18} onClick={() => deleteAttachment(index)} />
              </div>
            )
          })}
          {renderImages()}

          <FormField
            control={form.control}
            name="departmentIds"
            render={() => (
              <FormItem>
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
                      placeholder="All departments"
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
                      placeholder="All branches"
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
                <FormControl>
                  {loading && !reload && unitSearchValue ? (
                    <Input disabled={true} placeholder="Loading..." />
                  ) : (
                    <Select
                      onMenuClose={() => setReload(false)}
                      onMenuOpen={() => setReload(true)}
                      isClearable={true}
                      options={unitOptions}
                      placeholder="All units"
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
            className="font-semibold w-full rounded-lg bg-primary-light"
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
