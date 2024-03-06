"use client"

import { IAttachment } from "@/modules/feed/types"
import { X } from "lucide-react"

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
    <div className="w-full relative grid-cols-3 grid gap-3 mb-3">
      {images.map((image, index) => {
        return (
          <div
            className="relative"
            key={index}
          >
            <Image
              alt="image"
              src={image.url || ""}
              width={500}
              height={500}
              className={`overflow-hidden rounded-[4px] h-[170px] object-cover border border-exm`}
            />
            <X
              size={18}
              onClick={() => deleteImage(index)}
              className="absolute top-[10px] bg-[#c1c1c1] bg-opacity-40 p-[3px] right-[10px] rounded-full cursor-pointer"
            />
          </div>
        )
      })}
    </div>
  )
}

export default FormImages
