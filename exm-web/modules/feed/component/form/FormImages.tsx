"use client"

import { IAttachment } from "@/modules/feed/types"
import { XCircle } from "lucide-react"

import Image from "@/components/ui/image"

const FormImages = ({
  images,
  setImage,
}: {
  images: IAttachment[]
  setImage: (updated: IAttachment[]) => void
}) => {
  const deleteImage = (index: number) => {
    const updated = [...images]

    updated.splice(index, 1)

    setImage(updated)
  }

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="w-full h-[462px] flex flex-wrap overflow-hidden relative">
      {images.map((image, index) => {
        const length = images.length
        let width
        if (length === 1 || length === 2) {
          width = "w-full"
        }
        if (length === 3) {
          if (index === 2) {
            width = "w-full"
          } else {
            width = "w-[307px]"
          }
        }
        if (length === 4 || length > 4) {
          width = "w-[307px]"
        }

        if (index > 3) {
          return null
        }
        return (
          <div
            className={`relative ${width} ${
              length !== 1 ? "h-[227px]" : "h-full"
            } ${
              (length !== 1 &&
                length !== 2 &&
                length !== 3 &&
                index % 2 === 0 &&
                "mr-2") ||
              (length === 3 && index === 0 && "mr-2")
            } mb-2`}
            key={index}
          >
            <Image
              alt="image"
              src={image.url || ""}
              width={500}
              height={500}
              className={`overflow-hidden rounded-lg object-cover ${width} ${
                length !== 1 ? "h-[227px]" : "h-full"
              }`}
            />
            <XCircle
              size={18}
              onClick={() => deleteImage(index)}
              className="absolute top-0 bg-white right-0 rounded-full cursor-pointer"
            />
          </div>
        )
      })}
      {images.length > 4 && (
        <div className="text-white bg-black/50 w-[307px] h-[227px] absolute bottom-0 right-0 rounded-lg flex items-center justify-center text-[30px]">
          + {images.length - 4}
        </div>
      )}
    </div>
  )
}

export default FormImages
