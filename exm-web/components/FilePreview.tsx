import React, { useState } from "react"
import AudioVisualizer from "@/modules/chat/component/messages/AudioVisualizer"
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
      <DialogContent className="bg-transparent border-0 shadow-none max-w-2xl">
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
      <div className="relative">
        {deleteImage && fileIndex && (
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
    if (deleteImage && fileIndex) {
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

    if (grid && attachments) {
      return (
        <>
          <Dialog>
            <DialogTrigger asChild={true}>
              <div className="w-full h-[462px] flex flex-wrap overflow-hidden relative">
                {attachments.map((image, index) => {
                  const length = attachments.length
                  let width
                  if (length === 1 || length === 2) {
                    width = "w-full"
                  }
                  if (length === 3) {
                    if (index === 2) {
                      width = "w-full"
                    } else {
                      width = "w-[316px]"
                    }
                  }
                  if (length === 4 || length > 4) {
                    width = "w-[316px]"
                  }

                  if (index > 3) {
                    return null
                  }

                  return (
                    <Image
                      key={index}
                      alt="image"
                      src={image.url || ""}
                      width={500}
                      height={500}
                      className={`overflow-hidden rounded-lg object-cover cursor-pointer ${width} ${
                        length !== 1 ? "h-[227px]" : "h-full"
                      } ${
                        length !== 1 &&
                        length !== 2 &&
                        index % 2 === 0 &&
                        "mr-2"
                      } mb-2`}
                      onClick={() => setGridImageIndex(index)}
                    />
                  )
                })}
                {attachments.length > 4 && (
                  <div
                    className="text-white bg-black/50 w-[316px] h-[227px] absolute bottom-0 right-0 rounded-lg flex items-center justify-center text-[30px] cursor-pointer"
                    onClick={() => setGridImageIndex(3)}
                  >
                    + {attachments.length - 4}
                  </div>
                )}
              </div>
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
              } cursor-pointer bg-slate-600 rounded-lg`}
            >
              <Image
                alt="image"
                src={fileUrl || ""}
                width={500}
                height={500}
                className={`object-cover ${
                  isChat ? "w-[80px] h-[80px]" : "w-full h-full"
                } rounded-lg`}
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
        waveColor={"#b5b4b4"}
        progressColor={`${isMe ? "#fff" : "#8771D5"}`}
        from="message"
      />
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
