"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useTeamMembers } from "@/modules/feed/hooks/useTeamMembers"
import { Building, GitFork } from "lucide-react"
import { useInView } from "react-intersection-observer"

import { Input } from "@/components/ui/input"
import LoadingCard from "@/components/ui/loading-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUsers } from "@/components/hooks/useUsers"

const MemberCard = dynamic(() => import("./MemberCard"))

const List = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const {
    users,
    loading: usersLoading,
    usersTotalCount,
    handleLoadMore,
  } = useUsers({ searchValue })

  const { departments, branches } = useTeamMembers({})

  const handleSearch = (event: any) => {
    setSearchValue(event.target.value)
  }

  useEffect(() => {
    if (inView) {
      handleLoadMore()
    }
  }, [inView, handleLoadMore])

  if (usersLoading) {
    return (
      <ScrollArea className="h-screen">
        <LoadingCard />
      </ScrollArea>
    )
  }

  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-8 hover:font-medium hover:text-[#A1A1A1] flex-none mr-[50px] px-4 mt-4"

  const filteredUsers = () => {
    if (activeTab === "all") {
      return (
        <div className="w-full gap-5 mt-4 grid grid-cols-4 overflow-x-hidden overflow-y-auto">
          {users.map((user) => (
            <MemberCard key={Math.random()} user={user} />
          ))}
        </div>
      )
    }

    let items

    if (activeTab === "branch") {
      items = branches
    }

    if (activeTab === "department") {
      items = departments
    }

    return (
      <div className="flex flex-col w-full">
        {(items || []).map((item) => (
          <div key={Math.random()}>
            <h3 className="mt-4 font-bold text-[16px] flex items-center">
              {activeTab === "branch" ? (
                <Building size={15} className="mr-2" />
              ) : (
                <GitFork size={15} className="mr-2" />
              )}
              {item.title}
            </h3>
            <div className="w-full gap-3 mt-4 grid grid-cols-4 overflow-x-hidden overflow-y-auto">
              {users
                .filter((user) =>
                  (activeTab === "branch"
                    ? user.branchIds
                    : user.departmentIds
                  ).includes(item._id)
                )
                .map((user) => (
                  <MemberCard key={Math.random()} user={user} />
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="w-full h-full p-3">
        <Input
          className={"sm:rounded-lg border-none bg-white"}
          value={searchValue}
          autoFocus={true}
          placeholder={"Search Chat"}
          onChange={handleSearch}
        />

        <Tabs defaultValue={"all"}>
          <TabsList className="border-none flex">
            <TabsTrigger
              className={style}
              value="all"
              onClick={() => setActiveTab("all")}
            >
              All
            </TabsTrigger>
            <TabsTrigger
              className={style}
              value="branch"
              onClick={() => setActiveTab("branch")}
            >
              Branch
            </TabsTrigger>
            <TabsTrigger
              className={style}
              value="department"
              onClick={() => setActiveTab("department")}
            >
              Department
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full flex-col">
          <div className="h-[calc(100vh-185px)] overflow-x-hidden overflow-y-auto">
            {filteredUsers()}
            {!usersLoading && users.length < usersTotalCount && (
              <div ref={ref}>
                <LoadingCard />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default List
