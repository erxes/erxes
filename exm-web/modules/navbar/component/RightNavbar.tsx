"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { LogOut, User } from "lucide-react"

import Image from "@/components/ui/image"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import useMutations from "../hooks/useMutations"
import Notifications from "./Notifications"

const RightNavbar = () => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const { logout } = useMutations()
  const profileLink = window.location.pathname.includes('company/team-members') ? `detail?id=${currentUser._id}` : `company/team-members/detail?id=${currentUser._id}`

  return (
    <div className="p-3.5 border-b border-[#eee]">
      <div className="flex items-center justify-end">
        <Notifications />
        <Popover>
          <PopoverTrigger asChild={true}>
            <div className="cursor-pointer">
              <Image
                src={
                  currentUser.details && currentUser.details.avatar
                    ? currentUser?.details?.avatar
                    : "/avatar-colored.svg"
                }
                alt="User Profile"
                width={80}
                height={80}
                className="w-9 h-9 rounded-full object-cover mr-6"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="mr-8 w-fit p-2">
            <a
              className="flex gap-3 items-center px-4 py-2 cursor-pointer hover:bg-[#F0F0F0]"
              href={profileLink}
            >
              <User size={16} />
              My profile
            </a>
            <div
              className="flex gap-3 items-center px-4 py-2 cursor-pointer hover:bg-[#F0F0F0]"
              onClick={() => logout()}
            >
              <LogOut size={16} />
              Sign out
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default RightNavbar
