"use client"

import { IUser } from "@/modules/auth/types"
import { Facebook, Globe, Twitter, Youtube } from "lucide-react"

import Image from "@/components/ui/image"

const MemberCard = ({ user }: { user: IUser }): JSX.Element => {
  const userDetail = user.details

  return (
    <div className="border-[0.5px] border-[#BFBFBF] p-6 bg-white rounded-lg justify-center flex">
      <div className="p-0 pb-4 items-center">
        <a
          className="flex items-center flex-col cursor-pointer"
          href={`company/team-members/detail?id=${user._id}`}
        >
          <Image
            src={userDetail?.avatar || "/avatar-colored.svg"}
            alt="User Profile"
            width={100}
            height={100}
            className="w-[80px] h-[80px] rounded-full object-cover border border-primary"
          />
          <div className="mt-2 text-center">
            <div className="text-base font-bold text-gray-700 mb-2">
              {userDetail?.fullName ||
                userDetail?.username ||
                userDetail?.email}
            </div>
            {userDetail.position && (
              <p className="font-normal text-sm mb-2">{userDetail.position}</p>
            )}
            {userDetail.description && (
              <p className="text-[#5E5B5B] font-normal text-sm">
                {userDetail.description}
              </p>
            )}
          </div>
        </a>
        <div className="flex justify-center mt-3">
          <a
            href={user.links?.facebook}
            target="_blank"
            className="cursor-pointer"
          >
            <Facebook
              size={25}
              className="rounded-lg p-[5px] bg-[#1877F2] text-white mr-[5px]"
            />
          </a>
          <a
            href={user.links?.twitter}
            target="_blank"
            className="cursor-pointer"
          >
            <Twitter
              size={25}
              className="rounded-lg p-[6px] bg-[#1DA1F2] text-white mr-[5px]"
              fill="white"
            />
          </a>
          <a
            href={user.links?.youtube}
            target="_blank"
            className="cursor-pointer"
          >
            <Youtube
              size={25}
              className="rounded-lg p-[6px] bg-[#ff0000] text-white mr-[5px]"
            />
          </a>
          <a
            href={user.links?.website}
            target="_blank"
            className="cursor-pointer"
          >
            <Globe
              size={25}
              className="rounded-lg p-[6px] bg-primary-light text-white"
            />
          </a>
        </div>
      </div>
    </div>
  )
}

export default MemberCard
