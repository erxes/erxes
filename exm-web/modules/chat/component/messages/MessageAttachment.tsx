import FormAttachments from "@/modules/feed/component/form/FormAttachments"
import { IAttachment } from "@/modules/feed/types"

import { AttachmentWithChatPreview } from "@/components/AttachmentWithChatPreview"

const MessageAttachmentSection = ({
  attachments,
  isMe,
  isPinned,
}: {
  attachments: IAttachment[]
  isMe?: boolean
  isPinned?: boolean
}) => {
  const style = isMe
    ? `${"bg-[#fff] text-[#000] rounded-lg"}`
    : `${"bg-[#2970FF] text-[#fff] rounded-lg"}`

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
          className={`${
            isPinned
              ? "flex flex-wrap"
              : `grid ${
                  medias.length >= 3
                    ? "grid-cols-3"
                    : medias.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-1"
                }`
          } gap-3 py-1`}
          isDownload={true}
          isMe={isMe}
        />
      )}
      {files && <FormAttachments attachments={files} type="file" />}
      {audios && (
        <AttachmentWithChatPreview
          attachments={audios}
          className={`${style} p-2 max-w-md drop-shadow-md font-medium`}
          isMe={isMe}
        />
      )}
    </div>
  )
}
export default MessageAttachmentSection
