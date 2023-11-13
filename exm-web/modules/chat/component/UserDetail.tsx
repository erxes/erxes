"use client"

import { IUser } from "@/modules/auth/types"
import { ChevronRight } from "lucide-react"

import Image from "@/components/ui/image"

import { PinnedMessages } from "./messages/PinnedMessages"

const UserDetail = ({
  user,
  setShowSidebar,
}: {
  user: IUser
  setShowSidebar: () => void
}) => {
  const renderPinnedMessage = () => {
    return <PinnedMessages />
  }

  return (
    <>
      <div
        className="bg-[#F2F2F2] p-1 rounded-full w-fit cursor-pointer"
        onClick={() => setShowSidebar()}
      >
        <ChevronRight size={18} />
      </div>
      <div className="flex flex-col justify-center items-center pb-3">
        <div className="items-end flex mr-2">
          <div className="w-20 h-20 rounded-full">
            <Image
              src={(user && user.details?.avatar) || "/avatar-colored.svg"}
              alt="avatar"
              width={90}
              height={90}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-black">
            {user?.details?.fullName || user?.email}
          </h3>
          {user?.details?.position ? (
            <span className="text-sm font-medium text-[#444]">
              {" "}
              {user?.details?.position}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-black text-xs font-semibold">Email</p>
          <p className="text-[#444] text-xs">{user?.email || "-"}</p>
        </div>
        <div className="flex items-center justify-between mt-2 mb-4">
          <p className="text-black text-xs font-semibold">Phone</p>
          <p className="text-[#444] text-xs">
            {user?.details?.operatorPhone || "-"}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2 mb-4">
          <p className="text-black text-xs font-semibold">Employee ID</p>
          <p className="text-[#444] text-xs">{user?.employeeId || "-"}</p>
        </div>
        <div className="flex items-center justify-between mt-2 mb-4">
          <p className="text-black text-xs font-semibold">Departments</p>
          <p className="text-[#444] text-xs">
            <ul className="text-[#444]">
              {user.departments && user.departments.length !== 0
                ? user.departments.map((department) => (
                    <li className="text-[#444]" key={department._id}>
                      {department.title}
                    </li>
                  ))
                : "-"}
            </ul>
          </p>
        </div>
        <div className="flex items-center justify-between mt-2 mb-4">
          <p className="text-black text-xs font-semibold">Branches</p>
          <ul className="text-[#444]">
            {user.branches && user.branches.length !== 0
              ? user.branches.map((branch) => (
                  <li className="text-[#444]" key={branch._id}>
                    {branch.title}
                  </li>
                ))
              : "-"}
          </ul>
        </div>
        {renderPinnedMessage()}
      </div>
    </>
  )
}

export default UserDetail
