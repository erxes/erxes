import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { ThumbsUp } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useReactionQuery } from "../hooks/useReactionQuery"
import UsersList from "./UsersList"

export default function EmojiCount({
  postId,
  setDetailOpen,
  setCommentOpen,
  emojiOpen,
  setEmojiOpen,
  commentsCount,
  commentOpen
}: {
  postId: string
  setDetailOpen?: (state: boolean) => void
  setCommentOpen: (state: boolean) => void
  emojiOpen: boolean
  setEmojiOpen: (state: boolean) => void
  commentsCount: number
  commentOpen: boolean
}) {
  const { emojiCount, emojiReactedUser } =
    useReactionQuery({
      feedId: postId,
    })
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const idExists = emojiReactedUser.some(
    (item: any) => item._id === currentUser._id
  )

  if (emojiCount === 0 || !emojiCount) {
    return null
  }

  let text

  if (idExists) {
    text = `You ${
      emojiCount - 1 === 0 ? "" : ` and ${emojiCount - 1} others`
    }  liked this`
  } else {
    text = emojiCount
  }

  const onClickHandler = () => {
    setDetailOpen && setDetailOpen(true)
    setCommentOpen(!commentOpen)
  }

  return (
    <div className="flex my-3 justify-between text-[#475467] items-center px-4">
      <Dialog open={emojiOpen} onOpenChange={() => setEmojiOpen(!emojiOpen)}>
        <DialogTrigger asChild={true}>
          <div className="flex cursor-pointer items-center">
            <div className="bg-primary rounded-full w-[22px] h-[22px] flex items-center justify-center text-white mr-2">
              <ThumbsUp size={12} />
            </div>
            <div>{text}</div>
          </div>
        </DialogTrigger>
        <DialogContent className="p-0 gap-0 max-w-md">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="flex justify-around">People</DialogTitle>
          </DialogHeader>
          <UsersList users={emojiReactedUser} />
        </DialogContent>
      </Dialog>
      <div className="cursor-pointer" onClick={() => onClickHandler()}>
        {commentsCount} comments
      </div>
    </div>
  )
}
