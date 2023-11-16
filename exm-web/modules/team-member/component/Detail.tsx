"use client"

import { useEffect, useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import RightNavbar from "@/modules/navbar/component/RightNavbar"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtomValue } from "jotai"
import { Facebook, Globe, Twitter, Youtube } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import AvatarUpload from "@/components/AvatarUpload"

import useMutations from "../hooks/useMutations"
import { useUserDetail } from "../hooks/useUserDetail"
import ChangePassword from "./ChangePassword"

const FormSchema = z.object({
  operatorPhone: z.string().optional(),
  description: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  position: z.string().optional(),
  username: z.string(),
  password: z.string(),
  location: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  website: z.string().optional(),
  employeeId: z.string().optional(),
  email: z.string().email(),
  birthDate: z.union([z.string().optional(), z.date().optional()]),
  workStartedDate: z.union([z.string().optional(), z.date().optional()]),
})

const Detail = ({
  id,
  handleTabClick,
}: {
  id: string
  handleTabClick: (tab: string) => void
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const callBack = (result: string) => {
    if (result === "success") {
      toast({
        description: "Looking good!",
      })
      setValueIsChanged(false)
    }
  }
  const { userDetail } = useUserDetail({ userId: id })
  const { usersEditProfile, changePassword, changePasswordLoading } =
    useMutations({ callBack })
  const [open, setOpen] = useState(false)
  const [valueIsChanged, setValueIsChanged] = useState(false)
  const currentUser = useAtomValue(currentUserAtom)
  const [avatar, setAvatar] = useState(
    userDetail.details?.avatar || "/avatar-colored.svg"
  )

  useEffect(() => {
    let defaultValues = {} as any

    if (userDetail) {
      defaultValues = {
        ...userDetail,
        ...userDetail?.details,
        ...userDetail?.links,
      }
    }

    setAvatar(defaultValues.avatar)

    form.reset({ ...defaultValues })
  }, [userDetail])

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name) {
        setValueIsChanged(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-16 hover:font-medium hover:text-[#A1A1A1]"

  const disable = currentUser?._id !== id

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    usersEditProfile({
      email: data.email,
      username: data.username,
      details: {
        description: data.description,
        avatar,
        birthDate: data.birthDate,
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location,
        operatorPhone: data.operatorPhone,
        position: data.position,
        workStartedDate: data.workStartedDate,
      },
      links: {
        facebook: data.facebook,
        twitter: data.twitter,
        youtube: data.youtube,
        website: data.website,
      },
      password: data.password,
      employeeId: data.employeeId,
    })
  }

  const onAvatarUpload = (url: string) => {
    setAvatar(url)
    setValueIsChanged(true)
  }

  return (
    <div className="w-5/6 shrink-0">
      <div>
        <Tabs defaultValue="teamMembers">
          <TabsList className="border-b border-[#eee]">
            <div className="flex justify-between">
              <div className="w-[50%] items-center flex mr-auto h-[2.5rem] my-3 ml-[25px]">
                <TabsTrigger
                  className={style}
                  value="teamMembers"
                  onClick={() => handleTabClick("teamMembers")}
                >
                  Team members
                </TabsTrigger>
                <TabsTrigger
                  className={style}
                  value="structure"
                  onClick={() => handleTabClick("structure")}
                >
                  Structure
                </TabsTrigger>
                <TabsTrigger
                  className={style}
                  value="company"
                  onClick={() => handleTabClick("company")}
                >
                  Company
                </TabsTrigger>
              </div>
              <RightNavbar />
            </div>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-[#F8F9FA] h-[calc(100%-70px)] p-2">
        <Form {...form}>
          <form
            className="space-y-3 h-full"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex w-full h-full gap-2">
              <div className="flex flex-col justify-between items-center w-1/4 bg-white rounded-[5px] h-full gap-3 p-8">
                <div className="flex flex-col gap-3 w-full items-center">
                  <div className="items-end flex mr-2">
                    <AvatarUpload
                      avatar={avatar}
                      onAvatarUpload={onAvatarUpload}
                    />
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-black">
                      {userDetail?.details?.fullName || userDetail?.email}
                    </h3>
                    {userDetail?.details?.position ? (
                      <span className="text-sm font-medium text-[#444]">
                        {" "}
                        {userDetail?.details?.position}
                      </span>
                    ) : null}
                  </div>
                  <div className="w-full">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="mb-3">
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Type your bio"
                              {...field}
                              className="p-0 border-none disabled:opacity-100"
                              disabled={disable}
                              {...form.register("description")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-0 mb-3">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your email"
                              {...field}
                              className="p-0 border-none disabled:opacity-100 h-8"
                              disabled={disable}
                              {...form.register("email")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="operatorPhone"
                      render={({ field }) => (
                        <FormItem className="space-y-0 mb-3">
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your phone number"
                              {...field}
                              className="p-0 border-none disabled:opacity-100 h-8"
                              disabled={disable}
                              {...form.register("operatorPhone")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="space-y-0 mb-3">
                          <FormLabel className="block">Birthday</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={
                                field.value ? new Date(field.value) : undefined
                              }
                              setDate={field.onChange}
                              className="w-full p-0 border-none disabled:opacity-100 hover:bg-transparent h-8"
                              disabled={disable}
                              {...form.register("birthDate")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem className="space-y-0 mb-3">
                      <FormLabel>Score</FormLabel>
                      <p className="h-[32px] items-center flex">
                        {userDetail.score}
                      </p>
                    </FormItem>

                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem className="space-y-0 mb-3">
                          <FormLabel>Employee ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your employee id"
                              {...field}
                              className="p-0 border-none disabled:opacity-100 h-8"
                              disabled={disable}
                              {...form.register("employeeId")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {!disable && valueIsChanged && (
                  <Button
                    type="submit"
                    className="bg-[#F8F9FA] text-[#33363F] hover:bg-[#F8F9FA] border w-full"
                  >
                    Save
                  </Button>
                )}
                <div className="flex">
                  <a href={userDetail.links?.facebook} target="_blank">
                    <Facebook
                      size={25}
                      className="rounded-lg p-[5px] bg-[#1877F2] text-white mr-[5px]"
                    />
                  </a>
                  <a href={userDetail.links?.twitter} target="_blank">
                    <Twitter
                      size={25}
                      className="rounded-lg p-[6px] bg-[#1DA1F2] text-white mr-[5px]"
                      fill="white"
                    />
                  </a>
                  <a href={userDetail.links?.youtube} target="_blank">
                    <Youtube
                      size={25}
                      className="rounded-lg p-[6px] bg-[#ff0000] text-white mr-[5px]"
                    />
                  </a>
                  <a href={userDetail.links?.website} target="_blank">
                    <Globe
                      size={25}
                      className="rounded-lg p-[6px] bg-primary-light text-white"
                    />
                  </a>
                </div>
              </div>

              <div className="w-3/4 gap-2 flex flex-col">
                <div className="bg-white rounded-[5px] px-12 py-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-base text-black font-semibold">
                      Profile Details
                    </Label>
                    {!disable && valueIsChanged && (
                      <Button
                        type="submit"
                        className="bg-[#F8F9FA] text-[#33363F] hover:bg-[#F8F9FA] border"
                      >
                        Save
                      </Button>
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Type your first name"
                            {...field}
                            className="p-0 border-none disabled:opacity-100"
                            disabled={disable}
                            {...form.register("firstName")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Type your last name"
                            {...field}
                            className="p-0 border-none disabled:opacity-100"
                            disabled={disable}
                            {...form.register("lastName")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Type your username"
                            {...field}
                            className="p-0 border-none disabled:opacity-100"
                            disabled={disable}
                            {...form.register("username")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                          Position
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Type your position"
                            {...field}
                            className="p-0 border-none disabled:opacity-100"
                            disabled={disable}
                            {...form.register("position")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workStartedDate"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                          Contract Start Date
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            date={
                              field.value ? new Date(field.value) : undefined
                            }
                            setDate={field.onChange}
                            className="w-full p-0 border-none disabled:opacity-100 hover:bg-transparent"
                            disabled={disable}
                            {...form.register("workStartedDate")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Type your location"
                            {...field}
                            className="p-0 border-none disabled:opacity-100"
                            disabled={disable}
                            {...form.register("location")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!disable && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-y-0 h-[44px]">
                          <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your password"
                              {...field}
                              className="p-0 border-none disabled:opacity-100"
                            />
                          </FormControl>
                          <Dialog
                            open={open}
                            onOpenChange={() => setOpen(!open)}
                          >
                            <DialogTrigger asChild={true}>
                              <div className="whitespace-nowrap text-[#64748B] cursor-pointer">
                                Change Password
                              </div>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update your password</DialogTitle>
                              </DialogHeader>
                              <ChangePassword
                                changePassword={changePassword}
                                loading={changePasswordLoading}
                                setOpen={setOpen}
                              />
                            </DialogContent>
                          </Dialog>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                {!disable && (
                  <div className="bg-white rounded-[5px] px-12 py-6">
                    <div className="flex justify-between items-center">
                      <Label className="text-base text-black font-semibold">
                        Social Accounts
                      </Label>
                      {valueIsChanged && (
                        <Button
                          type="submit"
                          className="bg-[#F8F9FA] text-[#33363F] hover:bg-[#F8F9FA] border"
                        >
                          Save
                        </Button>
                      )}
                    </div>
                    <FormField
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-y-0">
                          <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                            Facebook
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your facebook"
                              {...field}
                              className="p-0 border-none"
                              {...form.register("facebook")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-y-0">
                          <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                            Twitter
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your twitter"
                              {...field}
                              className="p-0 border-none"
                              {...form.register("twitter")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="youtube"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-y-0">
                          <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                            Youtube
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your youtube"
                              {...field}
                              {...form.register("youtube")}
                              className="p-0 border-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-y-0">
                          <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                            Web Site
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your website"
                              {...form.register("website")}
                              {...field}
                              className="p-0 border-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Detail
