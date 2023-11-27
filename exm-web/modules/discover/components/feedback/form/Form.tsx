import React, { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { currentUserAtom, exmAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import EmojiPicker from "@/modules/chat/component/messages/EmojiPicker"
import { useFeedback } from "@/modules/discover/hooks/useFeedback"
import { useAtomValue } from "jotai"
import { Paperclip, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import uploadHandler from "@/components/uploader/uploadHandler"

import userFeedbackMutation from "../../../hooks/userFeedbackMutation"

type Props = {
  type: string
  currentStep: number
  setCurrentStep: (step: number) => void
  setToggleView: (view: boolean) => void
}

const Form = ({ type, currentStep, setCurrentStep, setToggleView }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentParams = Object.fromEntries(searchParams)
  const params = new URLSearchParams(currentParams)

  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const exm = useAtomValue(exmAtom)

  const [message, setMessage] = useState("")
  const [title, setTitle] = useState("")
  const [attachments, setAttachments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [inCheck, setInCheck] = useState(false)
  const [signature, setSignature] = useState(false)

  const textareaRef = useRef<any>(null)

  const { stage } = useFeedback({
    pipelineId: exm?.ticketPipelineId!,
  })

  useEffect(() => {
    setInCheck(currentStep !== 1)
  }, [currentStep])

  const color = exm ? exm.appearance.primaryColor : "#4f46e5"

  const buttonText =
    currentStep === 2 ? "Send" : currentStep === 1 ? "Continue" : "Done"

  const callBack = (result: string) => {
    if (result === "success") {
      setCurrentStep(4)
    }
  }

  const { addTickets, loading } = userFeedbackMutation({ callBack })

  const onSubmit = () => {
    if (message !== "" && title !== "") {
      setCurrentStep(currentStep + 1)

      if (currentStep === 2) {
        addTickets({
          name: `[${type}] ${title}`,
          description: message,
          attachments,
          stageId: stage?._id,
          customFieldsData: [],
        })

        params.set("page", "1")

        router.push(`?${params.toString()}`, {
          scroll: false,
        })
      }
    } else {
      toast({
        title: `Send feedback`,
        description: `Please fill required fields`,
        variant: "warning",
      })
    }

    if (currentStep >= 4) {
      clearStates()
    }
  }

  const clearStates = () => {
    setCurrentStep(1)
    setTitle("")
    setMessage("")
    setAttachments([])
    setSignature(false)
  }

  const onBack = () => {
    setCurrentStep(currentStep - 1)

    if (currentStep === 1) {
      setToggleView(false)

      params.set("view", "table")

      router.push(`?${params.toString()}`, {
        scroll: false,
      })
    }
  }

  const handleFileChange = (e: any) => {
    const files = e.target.files

    uploadHandler({
      files,
      beforeUpload: () => {
        setUploading(true)
      },
      afterUpload: ({ response, fileInfo }) => {
        setUploading(false)

        setAttachments((prevAttachments) => [
          ...prevAttachments,
          { url: response, ...fileInfo },
        ])
      },
    })
  }

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value)
  }

  const handleMessageChange = (e: any) => {
    setMessage(e.target.value)
  }

  const handleSignatureChange = (e: any) => {
    if (
      currentUser?.emailSignatures &&
      currentUser.emailSignatures.length > 0
    ) {
      if (e.target.checked) {
        setSignature(true)

        const signatureText =
          currentUser.emailSignatures[0]?.signature
            ?.replace(/<[^>]*>/g, "")
            .replace(/\n\s*/g, "\n") || ""

        setMessage(`${message}\n\n${signatureText.trim()}\n`)
      } else {
        setSignature(false)

        setMessage((prevMessage) => prevMessage.replace(/\n\n[\s\S]*\n/, "\n"))
      }
    } else {
      toast({
        title: "Signature required",
        description: "Please add a signature to your account.",
        variant: "warning",
      })
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prevAttachments) => {
      const updated = [...prevAttachments]
      updated.splice(index, 1)
      return updated
    })
  }

  const emojiHandler = (emojiData: any) => {
    const cursorPosition = textareaRef.current.selectionStart

    setMessage((prevMessage) => {
      const beforeCursor = prevMessage.slice(0, cursorPosition)
      const afterCursor = prevMessage.slice(cursorPosition)

      const newMessage = beforeCursor + emojiData.native + afterCursor
      const newCursorPosition = beforeCursor.length + emojiData.native.length

      setTimeout(() => {
        textareaRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition
        )
        textareaRef.current.focus()
      }, 0)

      return newMessage
    })
  }

  const renderActions = () => {
    if (currentStep !== 1) {
      return null
    }

    return (
      <>
        <label className="items-center cursor-pointer">
          <input
            autoComplete="off"
            type="file"
            multiple={true}
            onChange={handleFileChange}
            className="hidden"
            disabled={inCheck}
          />
          <Paperclip size={16} />
        </label>
        <EmojiPicker emojiHandler={emojiHandler} />
      </>
    )
  }

  const renderAttachments = () => {
    if (attachments.length === 0) {
      return null
    }

    return (
      <div className="h-full max-h-[100px] overflow-y-auto scrollbar-hide">
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
      </div>
    )
  }

  const renderActionSection = () => {
    return (
      <div className="relative flex gap-3 items-center">
        {renderActions()}

        {currentStep < 3 && (
          <Button
            onClick={onBack}
            style={{
              backgroundColor: color,
            }}
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
        )}
        <Button
          onClick={onSubmit}
          disabled={loading}
          style={{
            backgroundColor: currentStep === 1 ? color : "#3dcc38",
          }}
        >
          {buttonText}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 bg-white px-5 py-5 mt-5 border rounded divide-y">
      <div className="flex gap-1 w-full">
        <p>Title</p>
        {" : "}
        <input
          type="text"
          className="w-full outline-none disabled:bg-transparent"
          onChange={handleTitleChange}
          value={title}
          disabled={inCheck}
        />
      </div>
      <div className="flex flex-col pt-5 h-full">
        <textarea
          className="w-full resize-none outline-none scrollbar-hide disabled:bg-transparent"
          rows={15}
          value={message}
          onChange={handleMessageChange}
          autoComplete="off"
          ref={textareaRef}
          placeholder="Write more here ..."
          disabled={inCheck}
        />
        {renderAttachments()}
      </div>

      <div className="flex justify-between items-center pt-5">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="remember"
              type="checkbox"
              checked={signature}
              value=""
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
              onChange={handleSignatureChange}
            />
            <label
              htmlFor="remember"
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Whether to include signature
            </label>
          </div>
        </div>

        {renderActionSection()}
      </div>
    </div>
  )
}

export default Form
