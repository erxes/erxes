import React, { useEffect, useState } from "react"
import { IAttachment } from "@/modules/feed/types"
import { FilePlus } from "lucide-react"

import uploadHandler from "@/components/uploader/uploadHandler"

const DragNDrop = ({
  setAttachments,
  setImage,
  className,
  setUploading,
  defaultFileList,
}: {
  setAttachments: (files: any[]) => void
  setImage: (files: any[]) => void
  className?: string
  setUploading: (state: boolean) => void
  defaultFileList: IAttachment[]
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>(
    defaultFileList || ([] as IAttachment[])
  )
  const [isDragging, setIsDragging] = useState(false)

  let array = defaultFileList || ([] as any)

  const upload = (files: any) => {
    uploadHandler({
      files,

      beforeUpload: () => {
        setUploading(true)
      },

      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== "ok") {
          setUploading(false)
        }

        const attachment = { url: response, ...fileInfo }

        const updated = [...defaultFileList, attachment]
        array = array.concat(attachment)

        setUploadedFiles(array)

        setUploading(false)
      },
    })
  }

  const handleFileChange = (event: any) => {
    const files = event.target.files
    upload(files)

    event.target.value = ""
  }

  const handleDrop = (event: any) => {
    event.preventDefault()
    setIsDragging(false)

    const droppedFiles = event.dataTransfer.files
    upload(droppedFiles)
    event.target.value = ""
  }

  useEffect(() => {
    setImage(uploadedFiles.filter((f) => f.type.includes("image")))
    setAttachments(uploadedFiles.filter((f) => !f.type.includes("image")))
  }, [uploadedFiles])

  return (
    <section className={`drag-drop rounded-lg ${className}`}>
      <div
        className={`document-uploader ${
          isDragging ? "upload-box active" : "upload-box"
        }`}
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
      >
        <label htmlFor="browse">
          <div className="upload-info flex items-center flex-col">
            <div className="p-3 rounded-[12px] bg-[#eee] w-fit h-fit mb-3">
              <FilePlus />
            </div>
            <b className="">Add Photo/Videos</b>
            <span className="text-[#667085] text-xs">or drag and drop</span>
          </div>
          <input
            type="file"
            hidden
            id="browse"
            onChange={handleFileChange}
            multiple
          />
        </label>
      </div>
    </section>
  )
}

export default DragNDrop
