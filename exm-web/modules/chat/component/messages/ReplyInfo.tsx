import React from "react"
import { X } from "lucide-react"

const ReplyInfo = ({
  reply,
  setReply,
}: {
  reply: any
  setReply: (reply: any) => void
}) => {
  if (reply) {
    return (
      <div className="flex flex-col p-2 text-sm text-[#444] border-t border-b border-exm">
        <div className="flex justify-between">
          <div className="flex items-center">
            <b>
              Replying to{" "}
              {reply?.createdUser?.details?.fullName ||
                reply?.createdUser?.email}
            </b>
          </div>
          <X
            className="cursor-pointer"
            size={18}
            onClick={() => setReply(null)}
          />
        </div>
        <p className="max-w-full overflow-hidden truncate">
          {(reply.content === "<p></p>" || reply.content === "") ? "File" : reply.content}
        </p>
      </div>
    )
  } else {
    return <></>
  }
}

export default ReplyInfo
