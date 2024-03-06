"use client"

import { IAttachment } from "@/modules/feed/types"
import { ExternalLinkIcon, X } from "lucide-react"

import { readFile } from "@/lib/utils"
import Image from "@/components/ui/image"

const FormAttachments = ({
  attachments,
  setAttachments,
  deleteWithIndex,
  type,
}: {
  attachments: IAttachment[]
  type: string
  setAttachments?: (updated: IAttachment[]) => void
  deleteWithIndex?: (index: number) => void
}) => {
  const deleteAttachment = (index: number) => {
    if (deleteWithIndex) {
      deleteWithIndex(index)
    }

    if (setAttachments) {
      const updated = [...attachments]

      updated.splice(index, 1)

      setAttachments(updated)
    }
  }

  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <div
      className={` ${
        type === "postItem" && "px-4"
      } gap-[12px] flex flex-col pb-[12px] w-full`}
    >
      {attachments.map((a, index) => {
        const fileExtension = a.url.split(".").pop()
        let size
        const bg =
          fileExtension === "docx"
            ? "bg-[#fbeeff]"
            : fileExtension === "pdf"
            ? "bg-[#FFF9F5]"
            : "bg-[#F5FFF8]"

        const img =
          fileExtension === "docx"
            ? "/images/doc.png"
            : fileExtension === "pdf"
            ? "/images/pdf.png"
            : "/images/other.png"

        if ((a.size || 0) > 1000000) {
          size = `${Math.round((a.size || 0) / 1000000)}MB`
        }
        if ((a.size || 0) > 1000) {
          size = `${Math.round((a.size || 0) / 1000)}kB`
        }

        const item = (
          <div
            className={`flex ${bg} text-sm font-medium text-[#444] border border-[#F9FAFB] p-[12px] justify-between w-full rounded-lg gap-[12px] items-center`}
          >
            <Image src={img} alt="file-type-image" width={42} height={42} />
            <div className="flex flex-col w-[calc(100%-90px)]">
              <span className="truncate w-full">{a.name}</span>
              <span className="text-[#98A2B3]">{size}</span>
            </div>
            {type === "form" ? (
              <X
                size={18}
                onClick={() => deleteAttachment(index)}
                className="cursor-pointer"
              />
            ) : (
              <ExternalLinkIcon size={18} className="cursor-pointer" />
            )}
          </div>
        )

        if (type === "form") {
          return item
        }

        return (
          <a key={index} href={readFile(a.url)}>
            {item}
          </a>
        )
      })}
    </div>
  )
}

export default FormAttachments
