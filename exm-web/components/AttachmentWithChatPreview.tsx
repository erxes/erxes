"use client"

import { useState } from "react"
import { XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import Image from "@/components/ui/image"

export const AttachmentWithChatPreview = ({
  images,
  className,
  deleteImage,
}: {
  images: any[]
  className?: string
  deleteImage?: (index: number) => void
}) => {
  const [index, setIndex] = useState(0)

  const onDelete = (index: number) => {
    if (index > 0) {
      setIndex(index - 1)
    }

    if (deleteImage) {
      deleteImage(index)
    }

    return
  }

  const renderAttachmentPreview = () => {
    if (images && images.length === 0) {
      return null
    }

    return (
      <div id="gallery" className={cn("relative w-full", className)}>
        <div className="flex w-full overflow-x-auto">
          {images.map((image: any, i: number) => (
            <div key={i} className="mr-1 w-[80px] h-[80px] shrink-0">
              <button
                type="button"
                className="absolute bg-white p-1 rounded-full"
                onClick={() => onDelete(index)}
              >
                <XCircle size={18} />
              </button>

              <Image
                alt="image"
                src={image?.url || ""}
                width={500}
                height={500}
                className="object-contain w-[80px] h-[80px]"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <>{renderAttachmentPreview()}</>
}
