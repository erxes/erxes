"use client"

import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import Loader from "@/components/ui/loader"
import LoadingPost from "@/components/ui/loadingPost"
import SuccessPost from "@/components/ui/successPost"
import { Textarea } from "@/components/ui/textarea"
import DragNDrop from "@/components/DragNDrop"

import useFeedMutation from "../../hooks/useFeedMutation"
import { useTeamMembers } from "../../hooks/useTeamMembers"
import { IFeed } from "../../types"
import FormAttachments from "./FormAttachments"
import FormImages from "./FormImages"

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
  tab,
  changeTab,
  setOpen,
}: {
  feed?: IFeed
  tab: string
  changeTab: (tab: string) => void
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
  const [uploading, setUploading] = useState(false)

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

  const content = () => {
    if (tab === "share") {
      return (
        <div className="max-w-[500px] mx-auto flex flex-col gap-4">
          <b className="text-center">Who would you like to share</b>
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
          <Button
            type="submit"
            className="font-semibold w-full rounded-lg bg-primary-light"
            disabled={uploading}
          >
            Post
          </Button>
        </div>
      )
    }

    return (
      <>
        <div className="flex justify-center gap-6 mb-6 h-[calc(100%-50px)]">
          <div className="w-[566px] border border-exm rounded-md  h-full">
            <div className="overflow-auto h-[60%] px-4 pt-4">
              {uploading && <Loader className="pb-4" />}
              <FormImages images={images} setImage={setImage} />
              <FormAttachments
                attachments={attachments || []}
                setAttachments={setAttachments}
                type="form"
              />
            </div>

            <div className="flex h-[40%] border-t border-exm p-4">
              <DragNDrop
                setAttachments={setAttachments}
                setImage={setImage}
                className="w-full h-full"
                setUploading={setUploading}
                defaultFileList={images.concat(attachments)}
              />
            </div>
          </div>

          <div className="border border-exm rounded-md">
            <div className="px-4 py-3 border-b-2 border-exm">Post</div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="h-[calc(100%-46px)]">
                  <FormControl>
                    <Textarea
                      placeholder="Write a post"
                      {...field}
                      defaultValue={feed?.description || ""}
                      className="p-3 border-none w-[566px] !h-[100%] !max-h-[unset]"
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
    <div>
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
    </div>
  )
}

export default PostForm
