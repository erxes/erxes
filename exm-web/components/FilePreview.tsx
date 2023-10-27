import React from "react"
import { ExternalLinkIcon, XCircle } from "lucide-react"

import { readFile } from "@/lib/utils"

import { AttachmentWithPreview } from "./AttachmentWithPreview"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog"
import Image from "./ui/image"

export const FilePreview = ({
  fileUrl,
  fileName,
  deleteImage,
  fileIndex,
  isDownload,
  attachments,
  indexProp,
}: {
  fileUrl: string
  fileName?: string
  fileIndex: number
  deleteImage?: (index: number) => void
  isDownload?: boolean
  attachments?: any[]
  indexProp?: number
}) => {
  if (!fileUrl || !fileUrl.split) {
    return null
  }

  const onDelete = (index: number) => {
    if (deleteImage) {
      deleteImage(index)
    }

    return
  }

  const renderImageForm = () => {
    return (
      <DialogContent className="bg-transparent border-0 shadow-none max-w-2xl">
        <DialogHeader />
        <AttachmentWithPreview
          images={attachments || []}
          indexProp={indexProp}
        />
      </DialogContent>
    )
  }

  const renderFile = () => {
    return (
      <div className="relative">
        {deleteImage && (
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-white rounded-full"
            onClick={() => onDelete(fileIndex)}
          >
            <XCircle size={18} />
          </button>
        )}

        {isDownload ? (
          <a href={readFile(fileUrl)}>
            <div className="w-full p-2 rounded-md bg-[#F0F0F0]">
              <div className="flex gap-2 items-center font-semibold text-[#444] break-words">
                <ExternalLinkIcon size={18} /> {fileName}
              </div>
            </div>
          </a>
        ) : (
          <div className="p-2 rounded-md bg-[#F0F0F0] ">
            <div className="flex gap-2 items-center font-semibold text-[#444] break-words">
              <ExternalLinkIcon size={18} /> {fileName}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderImagePreview = () => {
    if (deleteImage) {
      return (
        <div className="relative shrink-0 w-14 h-14">
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-white rounded-full"
            onClick={() => onDelete(fileIndex)}
          >
            <XCircle size={18} />
          </button>

          <Image
            alt="image"
            src={fileUrl || ""}
            width={100}
            height={100}
            className="object-cover rounded-md w-14 h-14"
          />
        </div>
      )
    }

    return (
      <>
        <Dialog>
          <DialogTrigger asChild={true}>
            <div className="shrink-0 w-[80px] h-[80px] cursor-pointer bg-slate-600 rounded-lg">
              <Image
                alt="image"
                src={fileUrl || ""}
                width={500}
                height={500}
                className="object-cover w-[80px] h-[80px] rounded-lg"
              />
            </div>
          </DialogTrigger>

          {renderImageForm()}
        </Dialog>
      </>
    )
  }

  const fileExtension = fileUrl.split(".").pop()

  let filePreview

  switch (fileExtension) {
    case "docx":
      filePreview = renderFile()
      break
    case "pptx":
      filePreview = renderFile()
      break
    case "xlsx":
      filePreview = renderFile()
      break
    // case "mp4":
    //   filePreview = renderVideo()
    //   break
    // case "m3u8":
    //   filePreview = renderCloudflareStreamVideoFile()
    //   break
    case "jpeg":
    case "jpg":
    case "gif":
    case "png":
      filePreview = renderImagePreview()
      break
    case "zip":
    case "csv":
    case "doc":
    case "ppt":
    case "psd":
    case "avi":
    case "txt":
    case "rar":
    case "mp3":
    case "pdf":
    default:
      filePreview = renderFile()
  }

  return filePreview
}
