"use client"

import { useState } from "react"
import { XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import Image from "@/components/ui/image"

export const AttachmentWithPreview = ({
  images,
  className,
  deleteImage,
  indexProp,
}: {
  images: any[]
  className?: string
  deleteImage?: (index: number) => void
  indexProp?: number
}) => {
  const [index, setIndex] = useState(indexProp ? indexProp : 0)

  const onDelete = (i: number) => {
    if (i > 0) {
      setIndex(i - 1)
    }

    if (deleteImage) {
      deleteImage(i)
    }

    return
  }

  const renderAttachmentPreview = () => {
    const handleClick = (type: string) => {
      if (type === "previous" && index > 0) {
        setIndex(index - 1)
      }

      if (type === "next" && index < images.length - 1) {
        setIndex(index + 1)
      }
    }

    if (images && images.length === 0) {
      return null
    }

    return (
      <div id="gallery" className={cn("relative w-full", className)}>
        <div className="relative h-full overflow-hidden">
          <div className="relative" data-carousel-item={true}>
            <Image
              alt="image"
              src={images[index]?.url || ""}
              width={2000}
              height={2000}
              className="w-full h-full object-contain cursor-pointer max-h-[80vh]"
            />
          </div>
        </div>

        {deleteImage && (
          <button
            type="button"
            className="absolute top-1 right-1 bg-white p-1 rounded-full"
            onClick={() => onDelete(index)}
          >
            <XCircle size={18} />
          </button>
        )}

        {index > 0 && (
          <button
            type="button"
            className="absolute top-0 left-[-60px] z-30 flex items-center justify-center h-full px-4 cursor-pointer focus:outline-none"
            onClick={() => handleClick("previous")}
          >
            <span className="inline-flex items-center justify-center w-6 h-6">
              <svg
                className="w-6 h-6 text-white dark:text-gray-800"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 1 1 5l4 4"
                />
              </svg>
              <span className="sr-only">Previous</span>
            </span>
          </button>
        )}

        {index < images.length - 1 && (
          <button
            type="button"
            className="absolute top-0 right-[-60px] z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
            onClick={() => handleClick("next")}
          >
            <span className="inline-flex items-center justify-center w-6 h-6">
              <svg
                className="w-6 h-6 text-white dark:text-gray-800"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="sr-only">Next</span>
            </span>
          </button>
        )}
      </div>
    )
  }

  return <>{renderAttachmentPreview()}</>
}
