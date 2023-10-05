import React, { useState } from "react"
import { Paperclip, SendHorizontal } from "lucide-react"

type IProps = {
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

const Editor = ({ sendMessage }: IProps) => {
  const [message, setMessage] = useState("")
  const [attachments, setAttachment] = useState([])

  const handleInputChange = (e: any) => {
    setMessage(e.target.value)
  }

  const handleAttachmentChange = (e: any) => {
    const file = e.target.files

    setAttachment(file)
  }

  const onSubmit = () => {
    sendMessage({ content: message, attachments: [] })

    setAttachment([])
    setMessage("")
  }

  const onEnterPress = (e: any) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
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

      <label className="cursor-pointer mx-2">
        <input
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
