"use client"

import { AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogFooter } from "@/components/ui/dialog"
import LoadingPost from "@/components/ui/loadingPost"

import useChatsMutation from "../hooks/useChatsMutation"

type Props = {
  setOpen: (value: boolean) => void
  _id: string
}
const LeaveChat = ({ setOpen, _id }: Props) => {
  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { chatDelete, loading: mutationLoading } = useChatsMutation({
    callBack,
  })

  const onDelete = () => {
    chatDelete(_id)
  }

  return (
    <DialogContent>
      {mutationLoading ? <LoadingPost text="Leaving" /> : null}

      <div className="flex flex-col items-center justify-center">
        <AlertTriangleIcon size={30} color={"#6569DF"} /> Are you sure?
      </div>

      <DialogFooter className="flex flex-col items-center justify-center sm:justify-center sm:space-x-2">
        <Button
          className="font-semibold rounded-full bg-[#F2F2F2] hover:bg-[#F2F2F2] text-black"
          onClick={() => setOpen(false)}
        >
          No, Cancel
        </Button>

        <Button
          type="submit"
          className="font-semibold rounded-full"
          onClick={onDelete}
        >
          Yes, I am
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
export default LeaveChat