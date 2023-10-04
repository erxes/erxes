"use client"

import { cn } from "@/lib/utils"

import { FilePreview } from "./FilePreview"

export const AttachmentWithChatPreview = ({
  images,
  className,
  deleteImage,
}: {
  images: any[]
  className?: string
  deleteImage?: (index: number) => void
}) => {
  const renderAttachmentPreview = () => {
    if (images && images.length === 0) {
      return null
    }

    return (
      <div id="gallery" className={cn("relative w-full", className)}>
        <div className="flex w-full overflow-x-auto">
          {images.map((image: any, i: number) => (
            <FilePreview
              key={i}
              fileUrl={image.url}
              fileName={image.name}
              deleteImage={deleteImage}
              fileIndex={i}
            />
          ))}
        </div>
      </div>
    )
  }

  return <>{renderAttachmentPreview()}</>
}
