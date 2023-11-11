"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import Datetime from "@nateradebaugh/react-datetime"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Calendar } from "lucide-react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import SuccessPost from "@/components/ui/successPost"
import { Textarea } from "@/components/ui/textarea"
import SelectUsers from "@/components/select/SelectUsers"

import useFeedMutation from "../../hooks/useFeedMutation"
import { useTeamMembers } from "../../hooks/useTeamMembers"
import { IFeed } from "../../types"
import FormAttachments from "./FormAttachments"
import FormImages from "./FormImages"
import Uploader from "./uploader/Uploader"

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
}: {
  feed?: IFeed
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
  const [imageUploading, setImageUploading] = useState(false)
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [recipientIds, setRecipientIds] = useState(feed?.recipientIds || [])

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

  const onChangeMultiValue = (type: string, datas: any) => {
    const onchangeFunc = type === "department" ? setDepartmentIds : setBranchIds

    const ids = datas.map((data: any) => data.value)

    onchangeFunc(ids)
  }

  return (
    <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
      <DialogHeader>
        <DialogTitle>Create event</DialogTitle>
      </DialogHeader>

      {mutationLoading ? <LoadingPost /> : null}
      {success ? <SuccessPost /> : null}

      <div className="flex justify-end items-center">
        <div
          className="cursor-pointer px-2 py-1 hover:bg-[#F0F0F0] rounded-md"
          onClick={() =>
            setVisibility(visibility === "public" ? "private" : "public")
          }
        >
          {visibility === "private" ? "Make public" : "Make private"}
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          {visibility === "private" && (
            <FormField
              control={form.control}
              name="recipientIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select users</FormLabel>
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

          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Popover>
                      <PopoverTrigger className="w-full">
                        <div className="cursor-pointer flex rounded-md px-3 py-2 border items-center w-full border-light">
                          <Calendar size={15} className="mr-2" />
                          <span>
                            {field.value
                              ? dayjs(field.value).format("MM/DD/YYYY HH:mm")
                              : "Start date"}
                          </span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-fit">
                        <Datetime
                          inputProps={{ placeholder: "Start date" }}
                          dateFormat="YYYY/MM/DD"
                          timeFormat="HH:mm"
                          value={field.value}
                          closeOnSelect={true}
                          utc={true}
                          input={false}
                          onChange={field.onChange}
                          defaultValue={dayjs()
                            .startOf("day")
                            .add(12, "hour")
                            .format("YYYY-MM-DD HH:mm:ss")}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Popover>
                      <PopoverTrigger className="w-full">
                        <div className="cursor-pointer flex rounded-md px-3 py-2 border items-center w-full border-light">
                          <Calendar size={15} className="mr-2" />
                          <span>
                            {field.value
                              ? dayjs(field.value).format("MM/DD/YYYY HH:mm")
                              : "End date"}
                          </span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-fit">
                        <Datetime
                          inputProps={{ placeholder: "End date" }}
                          dateFormat="YYYY/MM/DD"
                          timeFormat="HH:mm"
                          value={field.value}
                          closeOnSelect={true}
                          utc={true}
                          input={false}
                          onChange={field.onChange}
                          defaultValue={dayjs()
                            .startOf("day")
                            .add(12, "hour")
                            .format("YYYY-MM-DD HH:mm:ss")}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Event name"
                    {...field}
                    className="border-light"
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
                <FormControl>
                  <Textarea
                    placeholder="Event description"
                    {...field}
                    defaultValue={feed?.description || ""}
                    className="border-light"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="where"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="rounded-md px-3 py-2 border-light"
                    placeholder="Add location"
                    {...field}
                    defaultValue={feed?.eventData?.where || ""}
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

          <FormAttachments
            attachments={attachments || []}
            setAttachments={setImage}
          />
          <FormImages images={images || []} setImage={setImage} />

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

export default EventForm
