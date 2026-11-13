"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import useUser from "@/modules/auth/hooks/useUser"
import {
  isCoverAmountsFetchedAtom,
  setCoverDetailAtom,
  resetCoverDetailAtom,
} from "@/store/cover.store"
import { useMutation, useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import Loader from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { onError } from "@/components/ui/use-toast"

import { Amounts } from "../components/amounts"
import { Dates } from "../components/cover-detail-dates"
import { CoverCU } from "../components/coverCU"
import { queries, mutations } from "../graphql"
import { Button } from "@/components/ui/button"
import { Cover } from "@/types/cover.types"

const CoverDetail = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const router = useRouter()
  const { userId } = useUser()
  const creating = useRef(false)
  const [createError, setCreateError] = useState("")
  const resetCover = useSetAtom(resetCoverDetailAtom)
  const [createCover] = useMutation<{ coversAdd: { _id: string } }>(
    mutations.coversAdd,
    {
      update: (cache) => {
        cache.evict({ id: "ROOT_QUERY", fieldName: "covers" })
      },
    }
  )
  useEffect(() => {
    if (id !== "create" || !userId || creating.current) return
    creating.current = true
    resetCover()
    createCover({
      variables: {
        userId,
        status: "draft",
        endDate: new Date(),
        description: "",
        details: [],
      },
    })
      .then(({ data }) => {
        if (!data?.coversAdd?._id) throw new Error("Хаалт үүссэнгүй")
        router.replace(`/cover/detail?id=${data.coversAdd._id}`)
      })
      .catch((error: unknown) =>
        setCreateError(error instanceof Error ? error.message : String(error))
      )
  }, [id, userId, createCover, resetCover, router])
  const setCover = useSetAtom(setCoverDetailAtom)
  const setIsFetched = useSetAtom(isCoverAmountsFetchedAtom)

  const { data, loading, error } = useQuery<{ coverDetail: Cover | null }>(
    queries.coverDetail,
    {
      variables: { id },
      fetchPolicy: "network-only",
      skip: !id || id === "create",
      onCompleted(data) {
        const { coverDetail } = data || {}
        if (coverDetail) {
          setCover(coverDetail)
          setIsFetched(coverDetail.status !== "draft")
        }
      },
      onError({ message }) {
        onError(message)
      },
    }
  )

  if (createError || error)
    return (
      <div role="alert" className="p-5 space-y-3">
        <p>{createError || error?.message}</p>
        <Button onClick={() => window.location.reload()}>Дахин оролдох</Button>
      </div>
    )
  if (loading || id === "create") return <Loader />
  if (!data?.coverDetail) return <div className="p-5">Хаалт олдсонгүй</div>

  return (
    <div className="flex-auto overflow-hidden ">
      <ScrollArea className="h-full max-h-full px-5 py-4">
        <div className="flex items-start justify-between">
          <Dates />
          <CoverCU />
        </div>
        <Amounts />
      </ScrollArea>
    </div>
  )
}

export default CoverDetail
