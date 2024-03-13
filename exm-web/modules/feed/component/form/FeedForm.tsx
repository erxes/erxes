"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { ChevronRight, PencilIcon } from "lucide-react"

import { readFile } from "@/lib/utils"
import { Card, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { IFeed } from "../../types"

const BravoForm = dynamic(() => import("./BravoForm"))
const EventForm = dynamic(() => import("./EventForm"))
const PostForm = dynamic(() => import("./PostForm"))

const FeedForm = ({
  contentType,
  feed,
}: {
  contentType: string
  feed?: IFeed
}) => {
  const currentUser = useAtomValue(currentUserAtom)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState("info")

  const userDetail = currentUser?.details || {}

  const renderForm = () => {
    switch (contentType) {
      case "post":
        return (
          <PostForm
            setOpen={setOpen}
            tab={tab}
            changeTab={setTab}
            feed={feed}
          />
        )
      case "bravo":
        return (
          <BravoForm
            setOpen={setOpen}
            tab={tab}
            changeTab={setTab}
            feed={feed}
          />
        )
      case "event":
        return (
          <EventForm
            setOpen={setOpen}
            tab={tab}
            changeTab={setTab}
            feed={feed}
          />
        )
    }
  }

  const getPLaceHolder = () => {
    switch (contentType) {
      case "post":
        return "Write a post"
      case "bravo":
        return "Create a bravo"
      case "event":
        return "Create event"
    }
  }

  const placeHolder = getPLaceHolder()

  const renderTrigger = () => {
    if (feed) {
      return (
        <DialogTrigger asChild={true}>
          <div className="text-black flex items-center">
            <PencilIcon size={16} className="mr-1" /> Edit
          </div>
        </DialogTrigger>
      )
    }

    return (
      <div className="max-w-[880px] w-full mx-auto">
        <Card className="w-full mx-auto mt-4 border-0">
          <CardHeader className="flex border border-exm rounded-[8px] py-2 px-3">
            <div className="flex items-center">
              <Image
                src={
                  userDetail.avatar
                    ? readFile(userDetail.avatar)
                    : "/avatar-colored.svg"
                }
                alt="User Profile"
                width={500}
                height={500}
                className="w-10 h-10 rounded-full object-cover border border-primary"
              />
              <div className="w-full ml-4">
                <DialogTrigger asChild={true}>
                  <div>
                    <Input
                      className="bg-[#FCFCFC] rounded-[8px] border-exm"
                      placeholder={`${placeHolder || "place"}`}
                    />
                  </div>
                </DialogTrigger>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const dialogHandler = () => {
    setOpen(!open)
    setTab("info")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={() => dialogHandler()}>
        {renderTrigger()}
        {open ? (
          <DialogContent className="h-[80vh] max-w-full translate-x-[0] translate-y-[0] bottom-0 top-[unset] left-0 overflow-auto !rounded-bl-none !rounded-br-none data-[state=open]:slide-in-from-left data-[state=open]:slide-in-from-bottom-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span
                  className={`${
                    tab === "info" ? "text-primary" : "text-primary-light"
                  }`}
                  onClick={() => setTab("info")}
                >
                  {feed ? "Edit" : "New"} {contentType}
                </span>
                <ChevronRight size={20} />
                <span
                  className={
                    tab === "info"
                      ? "text-gray-400 font-normal"
                      : "text-primary-light"
                  }
                  onClick={() => setTab("share")}
                >
                  Share to
                </span>
              </DialogTitle>
            </DialogHeader>
            {renderForm()}
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  )
}

export default FeedForm
