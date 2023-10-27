import React from "react"
import { ReplyIcon, XCircleIcon } from "lucide-react"

const ReplyInfo = ({
  reply,
  setReply,
}: {
  reply: any
  setReply: (reply: any) => void
}) => {
  if (reply) {
    return (
      <div className="flex flex-col p-2 text-xs text-[#444] rounded-lg bg-[#E2F0FF]">
        <div className="flex justify-between">
          <div className="flex items-center">
            <ReplyIcon size={15} className="mr-2" />
            <p>
              Replying to{" "}
              <b>
                {reply?.createdUser?.details?.fullName ||
                  reply?.createdUser?.email}
              </b>
            </p>
          </div>
          <XCircleIcon
            className="cursor-pointer"
            size={18}
            onClick={() => setReply(null)}
          />
        </div>
        <p className="max-w-md overflow-hidden truncate">{reply.content}</p>
      </div>
    )
  } else {
    return <></>
  }
}

export default ReplyInfo
