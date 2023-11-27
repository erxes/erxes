"use client"

import { cn } from "@/lib/utils"

import { FilePreview } from "./FilePreview"

export const AttachmentWithChatPreview = ({
  attachments,
  className,
  deleteImage,
  isDownload,
  isMe
}: {
  attachments: any[]
  className?: string
  deleteImage?: (index: number) => void
  isDownload?: boolean
  isMe?: boolean
}) => {
  const renderAttachmentPreview = () => {
    if (attachments && attachments.length === 0) {
      return null
    }

    return (
      <div id="gallery" className={"relative flex"}>
        <div className={cn(className)}>
          {attachments.map((image: any, i: number) => (
            <FilePreview
              key={i}
              fileUrl={image.url}
              fileName={image.name}
              deleteImage={deleteImage}
              fileIndex={i}
              isDownload={isDownload}
              attachments={attachments}
              indexProp={i}
              isMe={isMe}
            />
          ))}
        </div>
      </div>
    )
  }

  return <>{renderAttachmentPreview()}</>
}
