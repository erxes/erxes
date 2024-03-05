"use client"

import "react-datetime-picker/dist/DateTimePicker.css"
import "react-calendar/dist/Calendar.css"
import "react-clock/dist/Clock.css"
import { useEffect, useState } from "react"
import { IAttachment } from "@/modules/types"
import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Calendar } from "lucide-react"
import DateTimePicker from "react-datetime-picker"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import SuccessPost from "@/components/ui/successPost"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import DragNDrop from "@/components/DragNDrop"
import SelectUsers from "@/components/select/SelectUsers"

import useFeedMutation from "../../hooks/useFeedMutation"
import { useTeamMembers } from "../../hooks/useTeamMembers"
import { IFeed } from "../../types"
import FormAttachments from "./FormAttachments"
import FormImages from "./FormImages"

dayjs.extend(relativeTime)

const FormSchema = z
  .object({
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
    where: z
      .string({
        required_error: "Where must be chosen",
      })
      .refine((val) => val.trim().length !== 0, {
        message: "Where must be chosen",
      }),
    startDate: z.date(),
    endDate: z.date(),
    departmentIds: z.array(z.string()).optional(),
    branchIds: z.array(z.string()).optional(),
    unitId: z.string().optional(),
    recipientIds: z.array(z.object({})).optional(),
  })
  .refine(
    ({ startDate, endDate }) => {
      if (endDate && startDate && endDate < startDate) {
        return false
      }
      return true
    },
    {
      message: "End date must be later than the start date!",
      path: ["endDate"],
    }
  )

const EventForm = ({
  feed,
  setOpen,
  tab,
  changeTab,
}: {
  feed?: IFeed
  tab: string
  changeTab: (tab: string) => void
  setOpen: (open: boolean) => void
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const [visibility, setVisibility] = useState(
    feed?.eventData?.visibility || "public"
  )
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
  const [recipientIds, setRecipientIds] = useState(feed?.recipientIds || [])
  const [background, setBackground] = useState({} as IAttachment)

  const callBack = (result: string) => {
    if (result === "success") {
      form.reset()
      setReload(false)
      setAttachments([])
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

  const { departmentOptions, branchOptions, unitOptions, loading } =
    useTeamMembers({
      departmentIds,
      branchIds,
      unitIds: [unitId],

      branchSearchValue,
      departmentSearchValue,
      unitSearchValue,
      reload,
    })

  useEffect(() => {
    let defaultValues = {} as any
    let date = {} as any

    if (feed) {
      defaultValues = { ...feed }
      date = { ...feed.eventData }

      defaultValues.recipientIds = feed.recipientIds ? [{}] : []

      date.startDate = new Date(date.startDate)

      date.endDate = new Date(date.endDate)
    }

    form.reset({ ...defaultValues, ...date })
  }, [feed])

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!images || images.length === 0) {
      toast({ description: "Add Image" })
    }
    if (images && images.length > 0) {
      feedMutation(
        {
          title: data.title,
          description: data.description ? data.description : "",
          contentType: "event",
          departmentIds,
          branchIds,
          unitId,
          images,
          attachments,
          recipientIds,
          eventData: {
            visibility,
            where: data.where || "",
            startDate: data.startDate,
            endDate: data.endDate,
          },
        },
        feed?._id || ""
      )
    }
  }

  const onChangeMultiValue = (type: string, datas: any) => {
    const onchangeFunc = type === "department" ? setDepartmentIds : setBranchIds

    const ids = datas.map((data: any) => data.value)

    onchangeFunc(ids)
  }

  const content = () => {
    if (tab === "share") {
      return (
        <div className="flex flex-col gap-4 h-full relative">
          <b className="text-center">Who would you like to share</b>
          <div className="cursor-pointer px-3 py-2 border border-light rounded-lg flex justify-between items-center max-w-[500px] w-full mx-auto">
            Make private
            <div className="ml-3 flex h-6 items-center">
              <input
                onClick={() =>
                  setVisibility(visibility === "public" ? "private" : "public")
                }
                type="checkbox"
                className="h-4 w-4 rounded-lg border-light text-indigo-600 focus:ring-indigo-600"
              />
            </div>
          </div>
          {visibility === "private" && (
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
          )}

          <FormField
            control={form.control}
            name="departmentIds"
            render={() => (
              <FormItem className="max-w-[500px] w-full mx-auto ">
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
              <FormItem className="max-w-[500px] w-full mx-auto ">
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
              <FormItem className="max-w-[500px] w-full mx-auto ">
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
        <div className="flex justify-center gap-6 mb-6 h-[calc(100%-65px)]">
          <div className="max-w-[566px] border border-exm rounded-md w-full h-full">
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
          <div className="border border-exm rounded-md max-w-[566px] w-full h-full">
            <div className="px-4 py-3 border-b-2 border-[#0BA5EC] text-[#0BA5EC]">
              Event
            </div>
            <div className="p-3 gap-4 flex flex-col overflow-auto h-[calc(100%-46px)]">
              <div>
                <div className="font-semibold mb-2 text-gray-800">
                  Event location
                </div>
                <FormField
                  control={form.control}
                  name="where"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className="rounded-md px-3 py-2 border-exm"
                          placeholder="Add location..."
                          {...field}
                          defaultValue={feed?.eventData?.where || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <div className="font-semibold mb-2 text-gray-800">
                  Event name
                </div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Title"
                          {...field}
                          className="border-exm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="font-semibold mb-2 text-gray-800">
                    Start date
                  </div>
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Popover>
                            <PopoverTrigger className="w-full">
                              <div className="cursor-pointer flex rounded-md px-3 py-2 border items-center w-full border-exm">
                                <Calendar size={15} className="mr-2" />
                                <span>
                                  {field.value
                                    ? dayjs(field.value).format(
                                        "MM/DD/YYYY HH:mm"
                                      )
                                    : "Start date"}
                                </span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[305px] shadow-none p-2 border-exm">
                              <DateTimePicker
                                format="yyyy/MM/dd h:mm:ss a"
                                value={field.value}
                                onChange={field.onChange}
                                minDate={new Date()}
                                clockClassName="hidden"
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-2 text-gray-800">
                    End date
                  </div>
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Popover>
                            <PopoverTrigger className="w-full">
                              <div className="cursor-pointer flex rounded-md px-3 py-2 border items-center w-full border-exm">
                                <Calendar size={15} className="mr-2" />
                                <span>
                                  {field.value
                                    ? dayjs(field.value).format(
                                        "MM/DD/YYYY HH:mm"
                                      )
                                    : "End date"}
                                </span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[305px] shadow-none p-2 border-exm">
                              <DateTimePicker
                                format="yyyy/MM/dd h:mm:ss a"
                                value={field.value}
                                onChange={field.onChange}
                                minDate={new Date()}
                                clockClassName="hidden"
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="h-[calc(100%-236px)] min-h-[75px]">
                <div className="font-semibold mb-2 text-gray-800">
                  Description
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="h-[calc(100%-24px)] min-h-[50px]">
                      <FormControl>
                        <Textarea
                          placeholder="Start a caption..."
                          {...field}
                          defaultValue={feed?.description || ""}
                          className="border-exm !h-full !max-h-[unset] bg-[#FCFCFD]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
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

export default EventForm
