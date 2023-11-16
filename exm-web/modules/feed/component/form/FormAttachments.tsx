"use client"

import { IAttachment } from "@/modules/feed/types"
import { XCircle } from "lucide-react"

const FormAttachments = ({
  attachments,
  setAttachments,
}: {
  attachments: IAttachment[]
  setAttachments: (updated: IAttachment[]) => void
}) => {
  const deleteAttachment = (index: number) => {
    const updated = [...attachments]

    updated.splice(index, 1)

    setAttachments(updated)
  }

  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {(attachments || []).map((attachment, index) => {
        return (
          <div
            key={index}
            className="flex bg-[#EAEAEA] text-sm font-medium text-[#444] attachment-shadow px-2.5 py-[5px] justify-between w-full rounded-lg rounded-tr-none w-1/2 w-1/2 flex-1"
          >
            <p className="truncate">{attachment.name}</p>
            <XCircle size={18} onClick={() => deleteAttachment(index)} />
          </div>
        )
      })}
    </div>
  )
}

export default FormAttachments
