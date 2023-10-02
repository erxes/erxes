"use client"

import { IUser } from "@/modules/auth/types"

import { readFile } from "@/lib/utils"
import Avatar from "@/components/ui/avatar"

const UserDetail = ({ user }: { user: IUser }) => {
  return (
    <>
      <div className="flex flex-col justify-center items-center pb-3 border-b">
        <Avatar
          src={readFile(
            (user && user.details?.avatar) || "/avatar-colored.svg"
          )}
          alt="User Profile"
          width={500}
          height={500}
          className="w-20 h-20 rounded-full mb-2"
        />

        <div className="flex flex-col justify-center items-center">
          <h3 className="text-2xl font-semibold text-[#444]">
            {user?.details?.fullName || user?.email}
          </h3>
          {user?.details?.position ? (
            <span className="text-xs font-medium text-[#444]">
              {" "}
              {user?.details?.position}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-[#444] text-xs">Email</p>
          <p className="text-[#444] text-xs">{user?.email || "-"}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[#444] text-xs">Phone</p>
          <p className="text-[#444] text-xs">
            {user?.details?.operatorPhone || "-"}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[#444] text-xs">Employee ID</p>
          <p className="text-[#444] text-xs">{user?.employeeId || "-"}</p>
        </div>
      </div>
    </>
  )
}

export default UserDetail
