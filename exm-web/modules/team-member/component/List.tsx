"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useInView } from "react-intersection-observer"

import { Input } from "@/components/ui/input"
import LoadingCard from "@/components/ui/loading-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUsers } from "@/components/hooks/useUsers"

const MemberCard = dynamic(() => import("./MemberCard"))

const List = () => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const [searchValue, setSearchValue] = useState("")
  const { users, loading: usersLoading, usersTotalCount, handleLoadMore } = useUsers({ searchValue })

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

  return (
    <>
      <div className="w-full h-full p-3">
        <div className="">
          <Input
            className={"sm:rounded-lg border-none bg-white"}
            value={searchValue}
            placeholder={"Search Chat"}
            onChange={handleSearch}
          />
        </div>
        <div className="flex w-full flex-col">
          <div className="h-[calc(100vh-145px)] w-full gap-3 mt-4 grid grid-cols-4 overflow-x-hidden overflow-y-auto">
            {users.map((user) => (
              <MemberCard key={user._id} user={user} />
            ))}
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
