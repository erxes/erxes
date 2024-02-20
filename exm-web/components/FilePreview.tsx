import React, { useState } from "react"
import AudioVisualizer from "@/modules/chat/component/messages/AudioVisualizer"
import FormAttachments from "@/modules/feed/component/form/FormAttachments"
import { ExternalLinkIcon, X, XCircle } from "lucide-react"

import { readFile } from "@/lib/utils"

import { AttachmentWithPreview } from "./AttachmentWithPreview"
import { ImageGrid } from "./ImageGrid"
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
  isMe,
  grid,
}: {
  fileUrl: string
  fileName?: string
  fileIndex: number
  deleteImage?: (index: number) => void
  isDownload?: boolean
  attachments?: any[]
  indexProp?: number
  isMe?: boolean
  grid?: boolean
}) => {
  const [gridImageIndex, setGridImageIndex] = useState(0)
  const isChat = window.location.pathname.includes("chats")

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
      <DialogContent className="bg-transparent border-0 shadow-none max-w-[60rem]">
        <DialogHeader />
        <AttachmentWithPreview
          images={attachments || []}
          indexProp={grid ? gridImageIndex : indexProp}
        />
      </DialogContent>
    )
  }

  const renderFile = () => {
    return (
      <FormAttachments
        attachments={[attachments && attachments[fileIndex]]}
        deleteWithIndex={onDelete}
        type="form"
      />
    )
  }

  const renderImagePreview = () => {
    if (deleteImage && fileIndex + 1) {
      return (
        <div className="relative shrink-0 w-full h-[100px] mb-[12px] px-[6px]">
          <button
            type="button"
            className="absolute top-[6px] bg-[#c1c1c1] bg-opacity-40 p-[2px] right-[10px] rounded-full cursor-pointer"
            onClick={() => onDelete(fileIndex)}
          >
            <X size={16} />
          </button>

          <Image
            alt="image"
            src={fileUrl || ""}
            width={100}
            height={100}
            className="object-cover rounded-md w-full h-[100px]"
          />
        </div>
      )
    }

    if (grid && attachments) {
      return (
        <>
          <Dialog>
            <DialogTrigger asChild={true}>
              <ImageGrid
                attachments={attachments}
                onClickHandler={setGridImageIndex}
              />
            </DialogTrigger>

            {renderImageForm()}
          </Dialog>
        </>
      )
    }

    return (
      <>
        <Dialog>
          <DialogTrigger asChild={true}>
            <div
              className={`shrink-0 ${
                isChat ? "w-[80px] h-[80px]" : "w-full h-full"
              } cursor-pointer bg-slate-600 rounded-[6px]`}
            >
              <Image
                alt="image"
                src={fileUrl || ""}
                width={500}
                height={500}
                className={`object-cover ${
                  isChat ? "w-[80px] h-[80px]" : "w-full h-full"
                } rounded-[6px]`}
              />
            </div>
          </DialogTrigger>

          {renderImageForm()}
        </Dialog>
      </>
    )
  }

  const renderAudioFile = () => {
    if (deleteImage && fileIndex) {
      return (
        <div className="relative">
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-white rounded-full"
            onClick={() => onDelete(fileIndex)}
          >
            <XCircle size={18} />
          </button>
          <div className="p-2 rounded-md bg-[#F0F0F0] ">
            <div className="flex gap-2 items-center font-semibold text-[#444] break-words">
              <ExternalLinkIcon size={18} /> {fileName}
            </div>
          </div>
        </div>
      )
    }

    return (
      <AudioVisualizer
        url={readFile(fileUrl)}
        waveColor={isMe ? "#2970FF" : "#fff"}
        progressColor={`${isMe ? "#fff" : "#8771D5"}`}
        from="message"
      />
    )
  }

  const fileExtension = fileUrl.toLowerCase().split(".").pop()

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
    case "webm":
      filePreview = renderAudioFile()
      break
    case "mp3":
      filePreview = renderAudioFile()
      break
    // case "mp4":
    //   filePreview = renderVideo()
    //   break
    // case "m3u8":
    //   filePreview = renderCloudflareStreamVideoFile()
    //   break
    case "jpeg":
    case "jpg":
    case "JPG":
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
    case "pdf":
    default:
      filePreview = renderFile()
  }

  return filePreview
}
