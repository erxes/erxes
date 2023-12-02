import React, { useState } from "react"
import { useTicket } from "@/modules/discover/hooks/useTicket"
import { IAttachment } from "@/modules/types"

import { readFile } from "@/lib/utils"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Loader from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"

type Props = {
  ticketId: string
}

const FeedbackDialog = ({ ticketId }: Props) => {
  const { ticketDetail, loading } = useTicket(ticketId)

  const renderAttachments = (attachments: IAttachment[]) => {
    if (attachments?.length === 0) {
      return null
    }

    return (
      <div className="max-h-[100px] mt-auto overflow-y-auto scrollbar-hide">
        {attachments.map((attachment: IAttachment, index: number) => (
          <a
            key={index}
            className="flex justify-between bg-[#F4F1F1] p-3 mt-2 w-full truncate cursor-pointer"
            href={readFile(attachment.url)}
            download={attachment.name}
          >
            {`${attachment.name} (${attachment.size})`}
          </a>
        ))}
      </div>
    )
  }

  const renderDialogContent = () => {
    if (loading) {
      return (
        <div className="h-[400px] flex items-center justify-center">
          <Loader />
        </div>
      )
    }

    const matches = ticketDetail.name.match(/\[(.*?)\]\s(.*)/)

    return (
      <div className="flex justify-between py-5 px-0 bg-white rounded-md h-[400px]">
        <div className="flex flex-col group w-full divide-y">
          <div>
            <h3 className="w-full text-[16px] font-semibold leading-5 text-gray-900 capitalize">
              Title : {matches ? matches[2] : "-"}
            </h3>
          </div>
          <ScrollArea className="my-5 ">
            <div
              dangerouslySetInnerHTML={{
                __html: ticketDetail.description,
              }}
              className="h-full prose mt-5 max-w-none text-[14px]"
            />
          </ScrollArea>
          {renderAttachments(ticketDetail.attachments)}
        </div>
      </div>
    )
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          <span className="capitalize">Feedback</span>
        </DialogTitle>
      </DialogHeader>
      {renderDialogContent()}
    </DialogContent>
  )
}

export default FeedbackDialog
