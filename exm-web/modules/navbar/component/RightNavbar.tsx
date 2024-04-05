"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { ChevronDown, LogOut, User } from "lucide-react"

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
  const profileLink = window.location.pathname.includes("company/team-members")
    ? `detail?id=${currentUser._id}`
    : `company/team-members/detail?id=${currentUser._id}`

  return (
    <div className={` bg-white`}>
      <div className="flex items-center justify-end h-full">
        <Notifications />
        <Popover>
          <PopoverTrigger asChild={true}>
            <div className="h-full flex items-center px-4 border-l border-exm">
              <div className="cursor-pointer flex ">
                <Image
                  src={
                    currentUser.details && currentUser.details.avatar
                      ? currentUser?.details?.avatar
                      : "/avatar-colored.svg"
                  }
                  alt="User Profile"
                  width={80}
                  height={80}
                  className="w-[32px] h-[32px]"
                />

                <div className="leading-none mr-[12px] ml-[10px] flex flex-col justify-between">
                  <div>
                    {currentUser.details
                      ? currentUser.details.fullName
                      : currentUser.username}
                  </div>
                  <div className="font-normal font-[12px] text-[#475467]">
                    {currentUser.email}
                  </div>
                </div>
                <ChevronDown />
              </div>
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
