"use client"

import { useState } from "react"
import { Link } from "lucide-react"

import { readFile } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"

import { AttachmentWithPreview } from "../../../components/AttachmentWithPreview"

const SharedFiles = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const handleTabClick = (index: number) => {
    setActiveTabIndex(index)
  }

  const renderFileSize = (size: number) => {
    if (size > 1000000) {
      return <>({Math.round(size / 1000000)}MB)</>
    }
    if (size > 1000) {
      return <>({Math.round(size / 1000)}kB)</>
    }
  }

  const renderDatas = (type: string, item: any) => {
    if (type === "link") {
      return (
        <a href={item.src} target="_blank" className="flex mb-4 items-center">
          <div className="p-2 rounded-lg bg-[#ABABAB] mr-2">
            <Link size={15} className="text-white" />
          </div>
          <div className="flex flex-col text-[#707070]">{item.src}</div>
        </a>
      )
    }

    return (
      <a
        href={readFile(item.url)}
        download={true}
        className="flex mb-4 items-center"
      >
        <div className="p-2 rounded-lg bg-[#ABABAB] mr-2">
          <Link size={15} className="text-white" />
        </div>
        <div className="flex flex-col text-[#707070]">
          <p>{item.name}</p>
          <p className="text-xs">{renderFileSize(item.size)}</p>
        </div>
      </a>
    )
  }

  const attachments = [
    {
      _id: "6537493773b63c941c44f033",
      url: "0.7998292006692962Screenshot2023-10-17at12.17.32.png",
      name: "Screenshot 2023-10-17 at 12.17.32.png",
      size: 772101,
      type: "image/png",
    },
    {
      _id: "6537493773b63c941c44f032",
      url: "0.976131914500465Screenshot2023-10-19at17.51.45.png",
      name: "Screenshot 2023-10-19 at 17.51.45.png",
      size: 4384,
      type: "image/png",
    },
    {
      _id: "6537493773b63c941c44f031",
      url: "0.2742031156384068Screenshot2023-10-19at17.57.12.png",
      name: "Screenshot 2023-10-19 at 17.57.12.png",
      size: 4034,
      type: "image/png",
    },
    {
      _id: "6537493773b63c941c44f030",
      url: "0.12714214593478235Screenshot2023-10-19at17.57.17.png",
      name: "Screenshot 2023-10-19 at 17.57.17.png",
      size: 3997,
      type: "image/png",
    },
    {
      _id: "6537493773b63c941c4",
      url: "https://images.unsplash.com/photo-1697909623126-e2ecf6f66869?auto=format&fit=crop&q=80&w=2667&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Screenshot 2023-10-19 at 17.57.17.png",
      size: 3997,
      type: "image/png",
    },
  ]

  const renderMedia = () => {
    return (
      <div className="grid grid-cols-2 gap-3 shared-files-max-height">
        {attachments.map((att, index) => (
          <Dialog key={att._id}>
            <DialogTrigger asChild={true}>
              <div className="cursor-pointer">
                <Image
                  alt="image"
                  src={att.url || ""}
                  width={110}
                  height={90}
                  className="object-cover h-20 rounded-lg"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-0 shadow-none max-w-2xl">
              <DialogHeader />
              <AttachmentWithPreview
                images={attachments || []}
                indexProp={index}
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    )
  }

  const renderFiles = () => {
    return [
      {
        name: "payment.docx",
        size: 32250,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        url: "0.09960727060171326payment.docx",
        _id: "65373ffc73b63c941c44f02e",
      },
      {
        name: "payment.docx",
        size: 32250,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        url: "0.09960727060171326payment.docx",
        _id: "65373ffc73b63c941c44f02e",
      },
      {
        name: "payment.docx",
        size: 32250,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        url: "0.09960727060171326payment.docx",
        _id: "65373ffc73b63c941c44f02e",
      },
    ].map((item) => renderDatas("file", item))
  }

  const renderLinks = () => {
    return [
      { src: "https://office.erxes.io/" },
      { src: "https://fb.com/" },
      { src: "https://www.youtube.com/" },
      { src: "https://github.com/" },
      { src: "https://office.erxes.io/" },
      { src: "https://fb.com/" },
      { src: "https://www.youtube.com/" },
      { src: "https://github.com/" },
      { src: "https://office.erxes.io/" },
      { src: "https://fb.com/" },
      { src: "https://www.youtube.com/" },
      { src: "https://github.com/" },
      { src: "https://office.erxes.io/" },
      { src: "https://fb.com/" },
      { src: "https://www.youtube.com/" },
      { src: "https://github.com/" },
    ].map((item) => renderDatas("link", item))
  }

  return (
    <div>
      <div className="flex mb-4">
        {["Media", "Files", "Links"].map((type, index) => (
          <button
            key={index}
            className={`py-2 px-4 flex-1 bg-[#F2F2F2] rounded-lg ${
              activeTabIndex === index
                ? "bg-primary-light text-white"
                : "text-slate-500"
            } ${index !== 2 && "mr-4"}`}
            onClick={() => handleTabClick(index)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="overflow-auto group-shared-files-max-height">
        {activeTabIndex === 0 && renderMedia()}
        {activeTabIndex === 1 && renderFiles()}
        {activeTabIndex === 2 && renderLinks()}
      </div>
    </div>
  )
}

export default SharedFiles
