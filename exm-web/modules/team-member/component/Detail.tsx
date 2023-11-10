"use client"

import { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import RightNavbar from "@/modules/navbar/component/RightNavbar"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtomValue } from "jotai"
import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
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
import Loader from "@/components/ui/loader"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import AvatarUpload from "@/components/AvatarUpload"

import useMutations from "../hooks/useMutations"
import { useUserDetail } from "../hooks/useUserDetail"

const FormSchema = z.object({
  operatorPhone: z.string().optional(),
  description: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  position: z.string().optional(),
  username: z.string(),
  location: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  website: z.string().optional(),
  employeeId: z.string().optional(),
  email: z.string().email(),
  birthDate: z.date().optional(),
  workStartedDate: z.date().optional(),
})

const Detail = ({ id }: { id: string }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const { userDetail, loading } = useUserDetail({ userId: id })
  const { usersEditProfile } = useMutations()
  const currentUser = useAtomValue(currentUserAtom)
  const [avatar, setAvatar] = useState(
    userDetail.details?.avatar || "/avatar-colored.svg"
  )
  if (loading) {
    return <Loader />
  }

  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-16 hover:font-medium hover:text-[#A1A1A1]"
  console.log("userDetail", userDetail, userDetail.email)

  const disable = currentUser?._id !== id

  // useEffect(() => {
  //   let defaultValues = {} as any

  //   if (userDetail) {
  //     defaultValues = { ...userDetail }
  //   }
  // }, [userDetail])

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log("daa", avatar)
    usersEditProfile({
      email: data.email || userDetail.email,
      username: data.username || userDetail.username,
      details: {
        description: data.description || userDetail.details.description,
        avatar,
        birthDate: data.birthDate || userDetail.details.birthDate,
        firstName: data.firstName || userDetail.details.firstName,
        lastName: data.lastName || userDetail.details.lastName,
        location: data.location || userDetail.details.location,
        operatorPhone: data.operatorPhone || userDetail.details.operatorPhone,
        position: data.position || userDetail.details.position,
        workStartedDate:
          data.workStartedDate || userDetail.details.workStartedDate,
      },
      links: {
        facebook: data.facebook || userDetail.links?.facebook,
        twitter: data.twitter || userDetail.links?.twitter,
        youtube: data.youtube || userDetail.links?.youtube,
        website: data.website || userDetail.links?.website,
      },
      password: "Ariuka0215",
      employeeId: data.employeeId || userDetail.employeeId,
    })
  }

  const onAvatarUpload = (url: string) => {
    setAvatar(url)
  }

  return (
    <div className="w-5/6 shrink-0">
      <div>
        <Tabs defaultValue="post">
          <TabsList className="border-b border-[#eee]">
            <div className="flex justify-between">
              <div className="w-[50%] items-center flex mr-auto h-[2.5rem] my-3 ml-[25px]">
                <TabsTrigger className={style} value="teamMembers">
                  Team members
                </TabsTrigger>
                <TabsTrigger className={style} value="structure">
                  Structure
                </TabsTrigger>
                <TabsTrigger className={style} value="company">
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
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Type your bio"
                              {...field}
                              className="p-0 border-none disabled:opacity-100"
                              defaultValue={
                                userDetail.details?.description || ""
                              }
                              disabled={disable}
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
                        <FormItem className="space-y-0">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your email"
                              {...field}
                              className="p-0 border-none disabled:opacity-100"
                              defaultValue={userDetail.email || ""}
                              disabled={disable}
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
                        <FormItem className="space-y-0">
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your phone number"
                              {...field}
                              className="p-0 border-none disabled:opacity-100"
                              defaultValue={
                                userDetail.details?.operatorPhone || ""
                              }
                              disabled={disable}
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
                        <FormItem className="space-y-0">
                          <FormLabel className="block">Birthday</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={userDetail.details?.birthDate}
                              setDate={field.onChange}
                              className="w-full p-0 border-none disabled:opacity-100 hover:bg-transparent"
                              disabled={disable}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem className="space-y-0">
                      <FormLabel>Score</FormLabel>
                      <p className="h-[40px] items-center flex">
                        {userDetail.score}
                      </p>
                    </FormItem>

                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormLabel>Employee ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Type your employee id"
                              {...field}
                              className="p-0 border-none disabled:opacity-100"
                              defaultValue={userDetail.employeeId || ""}
                              disabled={disable}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
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
                    {!disable && (
                      <Button
                        type="submit"
                        className="bg-transparent text-[#33363F] hover:bg-transparent"
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
                            defaultValue={userDetail.details.firstName || ""}
                            disabled={disable}
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
                            defaultValue={userDetail.details.lastName || ""}
                            disabled={disable}
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
                            defaultValue={userDetail.username || ""}
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
                            defaultValue={userDetail.details.position || ""}
                            disabled={disable}
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
                            date={userDetail.details?.workStartedDate}
                            setDate={field.onChange}
                            className="w-full p-0 border-none disabled:opacity-100 hover:bg-transparent"
                            disabled={disable}
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
                            defaultValue={userDetail.details.location || ""}
                            disabled={disable}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!disable && (
                    <FormItem className="flex items-center space-y-0 h-[44px]">
                      <FormLabel className="w-[150px] mr-[200px] shrink-0 whitespace-nowrap">
                        Change Password
                      </FormLabel>
                      <p>************</p>
                    </FormItem>
                  )}
                </div>
                {!disable && (
                  <div className="bg-white rounded-[5px] px-12 py-6">
                    <div className="flex justify-between items-center">
                      <Label className="text-base text-black font-semibold">
                        Social Accounts
                      </Label>
                      <Button
                        type="submit"
                        className="bg-transparent text-[#33363F] hover:bg-transparent"
                      >
                        Save
                      </Button>
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
                              defaultValue={userDetail.links?.facebook || ""}
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
                              defaultValue={userDetail.links?.twitter || ""}
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
                              className="p-0 border-none"
                              defaultValue={userDetail.links?.youtube || ""}
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
                              {...field}
                              className="p-0 border-none"
                              defaultValue={userDetail.links?.website || ""}
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
