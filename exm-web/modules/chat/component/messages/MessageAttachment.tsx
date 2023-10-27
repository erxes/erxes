import { IAttachment } from "@/modules/feed/types"

import { AttachmentWithChatPreview } from "@/components/AttachmentWithChatPreview"

const MessageAttachmentSection = ({
  attachments,
}: {
  attachments: IAttachment[]
}) => {
  const medias = attachments.filter((attachment) =>
    attachment.type.startsWith("image/")
  )
  const files = attachments.filter((attachment) =>
    attachment.type.startsWith("application/")
  )

  return (
    <>
      {medias && (
        <AttachmentWithChatPreview
          attachments={medias}
          className={`grid ${
            medias.length >= 3
              ? "grid-cols-3"
              : medias.length === 2
              ? "grid-cols-2"
              : "grid-cols-1"
          } gap-1 py-1`}
          isDownload={true}
        />
      )}
      {files && (
        <AttachmentWithChatPreview
          attachments={files}
          className={`flex flex-col gap-1 py-1`}
          isDownload={true}
        />
      )}
    </>
  )
}
export default MessageAttachmentSection
