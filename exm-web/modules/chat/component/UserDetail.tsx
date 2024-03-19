"use client"

import { useState } from "react"
import { IUser } from "@/modules/auth/types"
import { ChevronDown, ChevronRight } from "lucide-react"

import Image from "@/components/ui/image"

import SharedFiles from "./SharedFiles"
import { PinnedMessages } from "./messages/PinnedMessages"

const UserDetail = ({ user }: { user: IUser }) => {
  const [screen, setScreen] = useState("main")
  const [showUserInfo, setShowUserInfo] = useState(false)

  const renderBrachDepartments = (type: string) => {
    let array
    if (type === "branch") {
      array = user.branches
    }
    if (type === "departments") {
      array = user.departments
    }
    if (array && array.length > 0) {
      return array.map((data) => (
        <li className="text-[#444] text-xs text-right" key={data._id}>
          {data.title}
        </li>
      ))
    }
    return "-"
  }

  if (screen === "files") {
    return <SharedFiles setScreen={setScreen} />
  }

  if (screen === "pinned") {
    return <PinnedMessages setScreen={setScreen} />
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center pb-3">
        <div className="items-end flex mr-2">
          <div className="w-16 h-16 rounded-full">
            <Image
              src={(user && user.details?.avatar) || "/avatar-colored.svg"}
              alt="avatar"
              width={90}
              height={90}
              className="w-16 h-16 rounded-full object-cover border-4 border-exm"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-black">
            {user?.details?.fullName || user?.email}
          </h3>
          {user?.details?.position ? (
            <span className="text-sm font-medium text-[#667085]">
              {user?.details?.position}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 text-[#475467] text-sm font-medium">
        <div
          className="flex justify-between cursor-pointer py-3"
          onClick={() => setShowUserInfo(!showUserInfo)}
        >
          User info
          {showUserInfo ? (
            <ChevronDown size={18} color="#475467" />
          ) : (
            <ChevronRight size={18} color="#475467" />
          )}
        </div>
        {showUserInfo && (
          <>
            <div className="py-3">
              <p>Email: {user?.email || "-"}</p>
            </div>
            <div className="py-3">
              <p>Phone: {user?.details?.operatorPhone || "-"}</p>
            </div>
            <div className="py-3">
              <p>Employee ID: {user?.employeeId || "-"}</p>
            </div>
            <div className="py-3 flex">
              <p className="mr-2">Departments: </p>
              <ul>{renderBrachDepartments("departments")}</ul>
            </div>
            <div className="py-3 flex">
              <p className="mr-2">Branches: </p>
              <ul>{renderBrachDepartments("branch")}</ul>
            </div>
          </>
        )}
        <div
          className="flex justify-between cursor-pointer py-3"
          onClick={() => setScreen("files")}
        >
          Attached files
          <ChevronRight size={18} color="#475467" />
        </div>
        <div
          className="flex justify-between cursor-pointer py-3"
          onClick={() => setScreen("pinned")}
        >
          View pinned chats
          <ChevronRight size={18} color="#475467" />
        </div>
      </div>
    </>
  )
}

export default UserDetail
