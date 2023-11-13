import React, { useState } from "react"
import { Image as ImageIcon, Paperclip } from "lucide-react"

import { Card } from "@/components/ui/card"
import uploadHandler from "@/components/uploader/uploadHandler"

export interface IAttachment {
  name: string
  type: string
  url: string
  size?: number
}

type Props = {
  defaultFileList: IAttachment[]
  onChange: (attachments: IAttachment[]) => void
  type?: string
  setUploading: (state: boolean) => void
}

const Uploader = ({ defaultFileList, onChange, type, setUploading }: Props) => {
  const [loading, setLoading] = useState(false)

  const handleFileInput = ({ target }: { target: any }) => {
    const files = target.files

    uploadHandler({
      files,

      beforeUpload: () => {
        setLoading(true)
        setUploading(true)
      },

      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== "ok") {
          setUploading(false)
          return setLoading(false)
        }

        const attachment = { url: response, ...fileInfo }

        const updated = [...defaultFileList, attachment]

        onChange(updated)

        setUploading(false)
        setLoading(false)
      },
    })

    target.value = ""
  }

  const uploadText =
    type && type === "image" ? "Upload images" : "Upload Attachments"

  const uploadIcon = type && type === "image" ? <ImageIcon /> : <Paperclip />

  const id = Math.random().toString()

  return (
    <Card className="bg-[#F0F0F0]">
      <div className="flex items-center space-x-2">
        <label
          htmlFor={id}
          className="cursor-pointer px-4 py-2  h-[50%] w-full flex items-center"
        >
          {uploadIcon}

          <div className="mx-5">
            {loading ? <p>Uploading ...</p> : <p>{uploadText}</p>}
          </div>
        </label>
        <input
          id={id}
          accept={type && type === "image" ? "image/*" : ""}
          type="file"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </Card>
  )
}

export default Uploader
