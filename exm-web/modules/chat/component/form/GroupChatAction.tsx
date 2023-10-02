"use client"

import { useState } from "react"
import Uploader from "@/modules/feed/component/form/uploader/Uploader"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"

import useChatsMutation from "../../hooks/useChatsMutation"
import { IChat } from "../../types"

export const GroupChatAction = ({
  chat,
  setOpen,
}: {
  chat: IChat
  setOpen: (open: boolean) => void
}) => {
  const { chatEdit, loadingEdit } = useChatsMutation()

  const [name, SetName] = useState(chat?.name || "")
  const [featuredImage, setFeaturedImage] = useState(chat?.featuredImage || [])

  const deleteImage = (index: number) => {
    const updated = [...featuredImage]

    updated.splice(index, 1)

    setFeaturedImage(updated)
  }

  const editAction = () => {
    chatEdit(chat._id, name, featuredImage)

    if (!loadingEdit) {
      setOpen(false)
    }
  }

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat Item edit</DialogTitle>
        </DialogHeader>

        <Label>Change group chat name</Label>
        <Input
          defaultValue={name}
          onChange={(e: any) => SetName(e.target.value)}
        />

        <Label>Change group chat image</Label>
        <Uploader
          defaultFileList={featuredImage || []}
          onChange={setFeaturedImage}
          type={"image"}
        />

        {featuredImage && featuredImage.length > 0 && (
          <AttachmentWithPreview
            images={featuredImage}
            className="mt-2"
            deleteImage={deleteImage}
          />
        )}

        <Button className="rounded-full" onClick={editAction}>
          Update
        </Button>
      </DialogContent>
    </>
  )
}
