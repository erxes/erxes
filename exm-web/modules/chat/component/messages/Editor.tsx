import React, { useRef, useState } from "react"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { Paperclip, Smile } from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import { AttachmentWithChatPreview } from "@/components/AttachmentWithChatPreview"
import uploadHandler from "@/components/uploader/uploadHandler"

import ReplyInfo from "./ReplyInfo"

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
  showSidebar: boolean
}

const Editor = ({ sendMessage, reply, setReply, showSidebar }: IProps) => {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<any[]>([])
  const relatedId = (reply && reply._id) || null
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)

  const [showEmoji, setShowEmoji] = useState(false)
  const textareaRef = useRef<any>(null)

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

        setAttachments((prevAttachments) => [
          ...prevAttachments,
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

  const attachmentsSection = () => {
    return (
      <div className="pt-2 overflow-auto w-full">
        {attachments && attachments.length > 0 && (
          <AttachmentWithChatPreview
            attachments={attachments || []}
            className="pb-2 flex w-full gap-3"
            deleteImage={deleteImage}
          />
        )}
      </div>
    )
  }

  const emojiHandler = (emojiData: any, event: MouseEvent) => {
    setMessage((inputValue) => inputValue + emojiData.native)
  }

  return (
    <div className={`border-t py-4 px-5 ${showSidebar && "w-[72.5%]"}`}>
      {attachments && attachments.length > 0 && attachmentsSection()}
      <div className="flex items-center justify-around gap-7 ">
        <div className="flex gap-4">
          <label className="cursor-pointer">
            <input
              autoComplete="off"
              type="file"
              multiple={true}
              onChange={handleAttachmentChange}
              className="hidden"
            />
            <Paperclip size={16} />
          </label>
        </div>
        <div className="w-full">
          <ReplyInfo reply={reply} setReply={setReply} />
          <div className="relative flex flex-1 items-center gap-4 p-5 rounded-lg bg-[#F5FAFF] drop-shadow-md">
            <textarea
              value={message}
              onChange={handleInputChange}
              onKeyDown={onEnterPress}
              autoComplete="off"
              ref={textareaRef}
              className="outline-none w-full h-auto bg-transparent resize-none scrollbar-hide"
              placeholder="Type your message"
              rows={1}
            />
            {showEmoji && (
              <div className="absolute bottom-16 right-0 z-10">
                <Picker
                  data={data}
                  onEmojiSelect={emojiHandler}
                  previewPosition="none"
                  searchPosition="none"
                  theme="light"
                />
              </div>
            )}
            <button onClick={() => setShowEmoji(!showEmoji)}>
              <Smile size={16} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-primary-light px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5532c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onSubmit}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Editor
