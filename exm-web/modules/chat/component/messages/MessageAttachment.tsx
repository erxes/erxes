import { IAttachment } from "@/modules/feed/types"

import { AttachmentWithChatPreview } from "@/components/AttachmentWithChatPreview"

const MessageAttachmentSection = ({
  attachments,
  isMe,
  isPinned
}: {
  attachments: IAttachment[]
  isMe?: boolean
  isPinned?: boolean
}) => {
  const style = isMe
    ? `${"bg-primary-light text-[#fff] rounded-tr-none rounded-tl-lg rounded-br-lg rounded-bl-lg"}`
    : `${"bg-[#F2F3F5] text-[#000] rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-lg"}`

  const medias = attachments.filter((attachment) =>
    attachment.type.startsWith("image/")
  )
  const files = attachments.filter((attachment) =>
    attachment.type.startsWith("application/")
  )
  const audios = attachments.filter((attachment) =>
    attachment.type.startsWith("audio/")
  )

  return (
    <div className="mt-2">
      {medias && (
        <AttachmentWithChatPreview
          attachments={medias}
          className={`${isPinned ? "flex flex-wrap" : `grid ${
            medias.length >= 3
              ? "grid-cols-3"
              : medias.length === 2
              ? "grid-cols-2"
              : "grid-cols-1"
          }`} gap-3 py-1`}
          isDownload={true}
        />
      )}
      {files && (
        <AttachmentWithChatPreview
          attachments={files}
          className={`flex flex-col gap-3 py-1`}
          isDownload={true}
        />
      )}
      {audios && (
        <AttachmentWithChatPreview
          attachments={audios}
          className={`${style} py-2.5 px-5 max-w-md drop-shadow-md font-medium`}
          isMe={isMe}
        />
      )}
    </div>
  )
}
export default MessageAttachmentSection
