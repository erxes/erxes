"use client"

import { useState } from "react"
import { SendHorizontal } from "lucide-react"

import Image from "@/components/ui/image"
import { toast } from "@/components/ui/use-toast"

import { useReactionMutaion } from "../../hooks/useReactionMutation"

const CommentForm = ({ feedId, avatar }: { feedId: string; avatar: string }) => {
  const { commentMutation } = useReactionMutaion({})

  const [comment, setComment] = useState("")

  const textareaStyle = {
    minHeight: "50px",
    height: `${Math.max(50, comment.split("\n").length * 20)}px`,
    maxHeight: "300px",
  }

  const handleInputChange = (e: any) => {
    setComment(e.target.value)
  }

  const onSubmit = () => {
    if (comment) {
      commentMutation(feedId, comment)
    } else {
      return toast({
        description: `Please enter comment`,
      })
    }

    setComment("")
  }

  const onEnterPress = (e: any) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="flex w-full gap-[10px] items-center py-3">
      <Image
        src={avatar || "/avatar-colored.svg"}
        alt="User Profile"
        width={100}
        height={100}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex items-center  rounded-lg bg-[#F2F4F7] w-[calc(100%-50px)] border border-exm">
        <textarea
          value={comment}
          onKeyDown={onEnterPress}
          onChange={handleInputChange}
          placeholder="Type a message..."
          style={textareaStyle}
          className="resize-none rounded-2xl px-4 pt-4 w-full focus:outline-none bg-[#F2F4F7]"
        />
        <label onClick={onSubmit} className="mr-2">
          <SendHorizontal size={18} className="text-[#98A2B3]" />
        </label>
      </div>
    </div>
  )
}

export default CommentForm
