import React, { useEffect, useRef, useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import EmojiPicker from "@/modules/chat/component/messages/EmojiPicker"
import { IUser } from "@/modules/types"
import { useAtomValue } from "jotai"
import { Paperclip, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import uploadHandler from "@/components/uploader/uploadHandler"

type Props = {
  type: string
  step: number
  setStep: (step: number) => void
}

const Form = ({ type, step, setStep }: Props) => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const [message, setMessage] = useState("")
  const [title, setTitle] = useState("")
  const [attachments, setAttachments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const [personalInfo, setPersonalInfo] = useState(false)

  const textareaRef = useRef<any>(null)

  const name = currentUser.details
    ? currentUser.details.fullName
    : currentUser.email
  const position = currentUser.details ? currentUser.details.position : ""
  const phone = currentUser.details ? currentUser : ""

  const signature = `
    &nbps
    <p>
      <span>Хүсэлт гаргасан: ${position} ${name}</span>
      <span>Холбоо барих утас: ${phone}</span>
    </p>
  `
  const buttonText = step === 2 ? "Илгээх" : "Үргэжлүүлэх"

  const handleAttachmentChange = (e: any) => {
    const files = e.target.files

    uploadHandler({
      files,
      beforeUpload: () => {
        setUploading(true)
        return
      },

      afterUpload: ({ response, fileInfo }) => {
        setUploading(false)

        setAttachments((prevAttachments) => [
          ...prevAttachments,
          Object.assign({ url: response }, fileInfo),
        ])
      },
    })
  }

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value)
  }

  const handleInputChange = (e: any) => {
    setMessage(e.target.value)
  }

  const handleRemoveAttachment = (index: number) => {
    const updated = [...attachments]
    updated.splice(index, 1)
    setAttachments(updated)
  }

  const emojiHandler = (emojiData: any) => {
    setMessage((inputValue) => inputValue + emojiData.native)
    textareaRef.current.focus()
  }

  return (
    <div className="flex flex-col gap-5 bg-white px-5 py-5 mt-5 border rounded divide-y ">
      <div className="flex gap-1 w-full">
        <p>Гарчиг</p>
        {" : "}
        <input
          type="text"
          className="w-full outline-none"
          onChange={handleTitleChange}
        />
      </div>
      <div className="flex flex-col pt-5 h-full">
        <textarea
          className="w-full resize-none outline-none scrollbar-hide"
          rows={10}
          value={message}
          onChange={handleInputChange}
          autoComplete="off"
          ref={textareaRef}
          placeholder="Энд дэлгэрэнгүй бичнэ үү ..."
        />
        {attachments && attachments.length !== 0 && (
          <ScrollArea className="max-h-[100px]">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex justify-between bg-[#F4F1F1] p-3 mt-2"
              >
                {`${attachment.name} (${attachment.size})`}
                <X
                  size={16}
                  onClick={() => handleRemoveAttachment(index)}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </ScrollArea>
        )}
      </div>

      <div className="flex justify-between items-center pt-5">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="remember"
              type="checkbox"
              value=""
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
              onChange={() => setPersonalInfo(!personalInfo)}
            />
          </div>
          <label
            htmlFor="remember"
            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Хувийн мэдээлэл оруулах эсэх
          </label>
        </div>

        <div className="relative flex gap-3 items-center">
          <label className="items-center cursor-pointer">
            <input
              autoComplete="off"
              type="file"
              multiple={true}
              onChange={handleAttachmentChange}
              className="hidden"
            />
            <Paperclip size={16} />
          </label>
          <EmojiPicker
            emojiHandler={(emojiData: any) => emojiHandler(emojiData)}
          />
          {(step === 2 || 3) && (
            <Button onClick={() => setStep(1)}>Буцах</Button>
          )}
          <Button onClick={() => setStep(step + 1)}>{buttonText}</Button>
        </div>
      </div>
    </div>
  )
}

export default Form
