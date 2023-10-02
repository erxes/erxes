"use client"

import { useState } from "react"
import { queries } from "@/common/team/graphql"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import { Input } from "@/components/ui/input"

import useChatsMutation from "../hooks/useChatsMutation"
import { IChat } from "../types"
import ParticipantItem from "./ParticipantItem"

const ParticipantList = ({ chat }: { chat: IChat }) => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const [userIds, setUserIds] = useState([])
  const [open, setOpen] = useState(false)

  const { data: usersData, loading } = useQuery(queries.users)

  const { users } = usersData || {}

  const { addOrRemoveMember } = useChatsMutation()

  const addMember = () => {
    addOrRemoveMember(chat._id, "add", userIds)
    setOpen(false)
  }

  const isAdmin =
    (chat?.participantUsers || []).find(
      (pUser) => pUser._id === currentUser._id
    )?.isAdmin || false

  const renderAdd = () => {
    const renderForm = () => {
      return (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create bravo</DialogTitle>
          </DialogHeader>

          {loading ? (
            <Input disabled={true} placeholder="Loading..." />
          ) : (
            <FacetedFilter
              options={(users || []).map((user: any) => ({
                label: user?.details?.fullName || user.email,
                value: user._id,
              }))}
              title="Users"
              values={userIds}
              onSelect={setUserIds}
            />
          )}
          <Button
            className="font-semibold w-full rounded-full"
            onClick={addMember}
          >
            Add
          </Button>
        </DialogContent>
      )
    }

    return (
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogTrigger asChild={true}>
          <div className="flex items-center mb-2 p-2 hover:bg-[#F0F0F0] cursor-pointer">
            <div className="p-2 bg-[#F0F0F0] rounded-full cursor-pointer mr-2">
              <PlusIcon size={18} />
            </div>
            <div className="">
              <p className="text-sm font-medium text-[#444]">Add member</p>
            </div>
          </div>
        </DialogTrigger>

        {renderForm()}
      </Dialog>
    )
  }

  return (
    <div className="mt-4">
      {chat.participantUsers.map((user: any, index: number) => (
        <ParticipantItem
          key={index}
          participant={user}
          chatId={chat._id}
          isAdmin={isAdmin}
        />
      ))}

      {isAdmin && renderAdd()}
    </div>
  )
}

export default ParticipantList
