import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { MessageCircleIcon, ThumbsUp } from "lucide-react"

import { CardFooter } from "@/components/ui/card"

import { useReactionMutaion } from "../hooks/useReactionMutation"

export default function PostFooter({
  setOpen,
  setCommentOpen,
  commentOpen,
  feedId,
  emojiReactedUser,
}: {
  setOpen: (state: boolean) => void
  setCommentOpen: (state: boolean) => void
  commentOpen: boolean
  feedId: string
  emojiReactedUser: any[]
}) {
  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { reactionMutation } = useReactionMutaion({
    callBack,
  })

  const reactionAdd = () => {
    reactionMutation(feedId)
  }

  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const idExists = emojiReactedUser.some(
    (item: any) => item._id === currentUser._id
  )

  return (
    <CardFooter className="border-t p-0 text-[#475467]">
      <div
        className="cursor-pointer flex items-center py-3 px-4"
        onClick={reactionAdd}
      >
        <ThumbsUp
          size={20}
          className="mr-1"
          color={`${idExists ? "#5B38CA" : "#475467"}`}
        />
        <div className={`${idExists ? "text-primary" : "text-[#475467]"}`}>
          Like
        </div>
      </div>
      <div
        className="cursor-pointer flex items-center py-3 px-4"
        onClick={() => setCommentOpen(!commentOpen)}
      >
        <MessageCircleIcon size={20} className="mr-1" color="#475467" />
        Comment
      </div>
    </CardFooter>
  )
}
