import React, { useState } from "react"

import Loader from "./ui/loader"
import { Upload } from "lucide-react"
import { readFile } from "@/lib/utils"
import uploadHandler from "@/components/uploader/uploadHandler"
import { useToast } from "@/components/ui/use-toast"

type Props = {
  avatar?: string
  defaultAvatar?: string
  onAvatarUpload: (response: any) => void
}

const AvatarUpload = ({ avatar, defaultAvatar, onAvatarUpload }: Props) => {
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(
    avatar || defaultAvatar || "/images/avatar-colored.svg"
  )
  const [avatarPreviewStyle, setAvatarPreviewStyle] = useState({})
  const [uploadPreview, setUploadPreview] = useState(null)
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files

    uploadHandler({
      files: imageFile,

      beforeUpload: () => {
        setAvatarPreviewStyle({ opacity: 0.2 })
      },

      afterUpload: ({ response, status }) => {
        setAvatarPreviewStyle({ opacity: 1 })

        // call success event
        onAvatarUpload(response)

        // remove preview
        if (setUploadPreview) {
          setUploadPreview(null)
        }

        if (status === "ok") {
          toast({
            description: "Looking good!",
          })
        } else {
          toast({
            description: response,
          })
        }
      },

      afterRead: ({ result, fileInfo }) => {
        if (setUploadPreview) {
          setUploadPreview((prevPreview: any) => {
            return fileInfo
              ? Object.assign({ data: result }, fileInfo)
              : prevPreview
          })
        }
        setAvatarPreviewUrl(result)
      },
    })
  }

  const renderUploadLoader = () => {
    if (!uploadPreview) {
      return null
    }

    return <Loader />
  }

  return (
    <div className="w-[90px] h-[90px] relative mb-[20px] flex items-center overflow-hidden rounded-full">
      <img
        alt="avatar"
        style={avatarPreviewStyle}
        src={readFile(avatarPreviewUrl)}
      />
      <label className="text-white transition-all absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center z-2 hover:bg-[#00000066] opacity-0 hover:opacity-100">
        <Upload size={30} className="cursor-pointer" />
        <input type="file" onChange={handleImageChange} className="hidden" />
      </label>
      {renderUploadLoader()}
    </div>
  )
}

export default AvatarUpload
