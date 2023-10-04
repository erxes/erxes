import React, { useState } from "react"
import { Paperclip, SendHorizontal } from "lucide-react"

import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"
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
        return
      },

      afterUpload: ({ response, fileInfo }) => {
        setAttachments([
          ...attachments,
          Object.assign({ url: response }, fileInfo),
        ])
      },
    })
  }

  const onSubmit = () => {
    sendMessage({ content: message, relatedId, attachments })

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
    <div className="flex items-center px-2 bg-white rounded-2xl focus:outline-none focus:border-black">
      <textarea
        value={message}
        onKeyDown={onEnterPress}
        onChange={handleInputChange}
        placeholder="Type a message..."
        style={textareaStyle}
        className="resize-none rounded-2xl px-4 pt-4 w-full  focus:outline-none"
      />

      {attachments && attachments.length > 0 && (
        <AttachmentWithPreview
          images={attachments}
          className="w-[100px]"
          deleteImage={deleteImage}
        />
      )}

      <label className="cursor-pointer mx-2">
        <input
          autoComplete="off"
          multiple={true}
          type="file"
          accept="image/*, .pdf, .doc, .docx"
          onChange={handleAttachmentChange}
          className="hidden"
        />
        <Paperclip size={18} />
      </label>
      <label onClick={onSubmit} className="mr-2">
        <SendHorizontal size={18} />
      </label>
    </div>
  )
}

export default Editor
