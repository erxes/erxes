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
}: {
  fileUrl: string
  fileName?: string
  fileIndex: number
  deleteImage?: (index: number) => void
  isDownload?: boolean
  attachments?: any[]
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
      <DialogContent>
        <DialogHeader />
        <AttachmentWithPreview images={attachments || []} />
      </DialogContent>
    )
  }

  const renderFile = () => {
    return (
      <div className="relative">
        {deleteImage && (
          <button
            type="button"
            className="absolute top-0 bg-white p-1 rounded-full"
            onClick={() => onDelete(fileIndex)}
          >
            <XCircle size={18} />
          </button>
        )}

        {isDownload ? (
          <a href={readFile(fileUrl)}>
            <div className="mr-1 p-2 rounded-lg bg-[#F0F0F0]">
              <div className="flex items-center text-sm font-semibold text-[#444] break-words">
                <ExternalLinkIcon size={18} /> {fileName}
              </div>{" "}
            </div>
          </a>
        ) : (
          <div className="mr-1 p-2 rounded-lg bg-[#F0F0F0]">
            <div className="flex items-center text-sm font-semibold text-[#444] break-words">
              <ExternalLinkIcon size={18} /> {fileName}
            </div>{" "}
          </div>
        )}
      </div>
    )
  }

  const renderImagePreview = () => {
    if (deleteImage) {
      return (
        <div className="mr-1 w-[80px] h-[80px] shrink-0">
          <button
            type="button"
            className="absolute top-0 bg-white p-1 rounded-full"
            onClick={() => onDelete(fileIndex)}
          >
            <XCircle size={18} />
          </button>

          <Image
            alt="image"
            src={fileUrl || ""}
            width={500}
            height={500}
            className="object-contain w-[80px] h-[80px]"
          />
        </div>
      )
    }

    return (
      <>
        <Dialog>
          <DialogTrigger asChild={true}>
            <div className="mr-1 w-[80px] h-[80px] shrink-0 cursor-pointer">
              <Image
                alt="image"
                src={fileUrl || ""}
                width={500}
                height={500}
                className="object-contain w-[80px] h-[80px]"
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
