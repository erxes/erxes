"use client"

import { useState } from "react"
import FormAttachments from "@/modules/feed/component/form/FormAttachments"
import { ArrowLeft } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"

import { AttachmentWithPreview } from "../../../components/AttachmentWithPreview"
import { useSharedMedia } from "../hooks/useSharedMedia"

const SharedFiles = ({ setScreen }: { setScreen: (type: string) => void }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const { sharedMedia, loading } = useSharedMedia()

  const allAttachments = sharedMedia.flatMap((item: any) => item.attachments)

  const image = allAttachments.filter((a: any) => a.type.includes("image"))

  const other = allAttachments.filter((a: any) => !a.type.includes("image"))

  const handleTabClick = (index: number) => {
    setActiveTabIndex(index)
  }

  const renderMedia = () => {
    return (
      <div className="grid grid-cols-2 gap-3 shared-files-max-height">
        {image.map((att: any, index: number) => (
          <Dialog key={att._id}>
            <DialogTrigger asChild={true}>
              <div className="cursor-pointer">
                <Image
                  alt="image"
                  src={att.url || ""}
                  width={110}
                  height={90}
                  className="object-cover h-20 rounded-lg w-full"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-0 shadow-none max-w-2xl">
              <DialogHeader />
              <AttachmentWithPreview images={image || []} indexProp={index} />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    )
  }

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <div
        className="flex text-[#475467] font-medium text-base items-center gap-3 mb-5 cursor-pointer"
        onClick={() => setScreen("main")}
      >
        <ArrowLeft size={18} color="#475467" /> Attached files
      </div>
      <div className="flex mb-4">
        {["Media", "Files"].map((type, index) => (
          <button
            key={index}
            className={`py-3 px-4 flex-1 flex items-center gap-2 justify-center border-b border-exm ${
              activeTabIndex === index && "!border-primary"
            }`}
            onClick={() => handleTabClick(index)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="overflow-auto group-shared-files-max-height">
        {activeTabIndex === 0 && renderMedia()}
        {activeTabIndex === 1 && (
          <FormAttachments attachments={other} type="file" />
        )}
      </div>
    </>
  )
}

export default SharedFiles
