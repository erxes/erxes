"use client"

import { FunctionComponent } from "react"
import Link from "next/link"
import { currentUserAtom } from "@/modules/JotaiProvider"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { ChevronDown, LogOut, User } from "lucide-react"

import Avatar from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import useMutations from "../hooks/useMutations"

interface ProfileProps {}

const Profile: FunctionComponent<ProfileProps> = () => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const { details, email } = currentUser || {}

  const { fullName, avatar } = details || {}

  const { logout } = useMutations()

  const profileLink = ""

  return (
    <Popover>
      <PopoverTrigger className="h-full px-4 hover:bg-gray-100 border-l">
        <div className="flex items-center gap-2 ">
          <Avatar
            src={avatar || "/images/avatar-colored.svg"}
            fallBack="hello"
            alt="avatar"
            width={32}
            height={32}
          />

          <div className="flex flex-col items-start">
            <p className="text-sm font-semibold">{fullName}</p>
            <p className="text-xs text-gray-600">{email}</p>
          </div>

          <ChevronDown />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2 flex flex-col gap-2 cursor-pointer">
        <Link href={profileLink}>
          <div className="flex gap-2 items-center hover:bg-gray-100 p-2 rounded-md">
            <User size={16} />

            <p>Account details</p>
          </div>
        </Link>

        <div
          onClick={() => logout()}
          className="flex gap-2 items-center  hover:bg-gray-100 p-2 rounded-md"
        >
          <LogOut size={16} color="red" />

          <p>Sign out</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default Profile
