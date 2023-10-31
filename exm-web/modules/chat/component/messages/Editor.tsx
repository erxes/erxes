import React, { useState } from "react"
import { Paperclip, SendHorizontal } from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import { AttachmentWithChatPreview } from "@/components/AttachmentWithChatPreview"
import uploadHandler from "@/components/uploader/uploadHandler"

type IProps = {
  reply: any
  setReply: (reply: any) => void
  sendMessage: ({
    content,
    relatedId,
    attachments,
  }: {
    content?: string
    relatedId?: string
    attachments?: string[]
  }) => void
}

const Editor = ({ sendMessage, reply, setReply }: IProps) => {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<any[]>([])
  const relatedId = (reply && reply._id) || null
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: any) => {
    setMessage(e.target.value)
  }

  const deleteImage = (index: number) => {
    const updated = [...attachments]

    updated.splice(index, 1)

    setAttachments(updated)
  }

  const handleAttachmentChange = (e: any) => {
    const files = e.target.files

    uploadHandler({
      files,
      beforeUpload: () => {
        setLoading(true)
        return
      },

      afterUpload: ({ response, fileInfo }) => {
        setLoading(false)
        setAttachments([
          ...attachments,
          Object.assign({ url: response }, fileInfo),
        ])
      },
    })
  }

  const onSubmit = () => {
    if (message) {
      sendMessage({ content: message, relatedId, attachments })
    } else {
      return toast({
        description: `Please enter message`,
      })
    }

    setAttachments([])
    setMessage("")
    setReply(null)
  }

  const onEnterPress = (e: any) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault()
      onSubmit()
    }
  }

  const textareaStyle = {
    minHeight: "50px",
    height: `${Math.max(50, message.split("\n").length * 20)}px`,
    maxHeight: "300px",
  }

  return (
    <>
      <div>
        {attachments && attachments.length > 0 && (
          <AttachmentWithChatPreview
            attachments={attachments || []}
            className="m-2 rounded-lg"
            deleteImage={deleteImage}
          />
        )}
      </div>

      <div className="flex items-center px-2 bg-white rounded-2xl focus:outline-none focus:border-black">
        <textarea
          value={message}
          onKeyDown={onEnterPress}
          onChange={handleInputChange}
          placeholder="Type a message..."
          style={textareaStyle}
          className="resize-none rounded-2xl px-4 pt-4 w-full  focus:outline-none"
        />

        {loading ? (
          <p className="mr-2">uploading...</p>
        ) : (
          <>
            <label className="cursor-pointer mx-2">
              <input
                autoComplete="off"
                multiple={true}
                type="file"
                onChange={handleAttachmentChange}
                className="hidden"
              />
              <Paperclip size={18} />
            </label>
            <label onClick={onSubmit} className="mr-2">
              <SendHorizontal size={18} />
            </label>
          </>
        )}
      </div>
    </>
  )
}

export default Editor
