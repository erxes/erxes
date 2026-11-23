import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import useUser from "@/modules/auth/hooks/useUser"
import {
  isCoverAmountsFetchedAtom,
  resetCoverDetailAtom,
  setCoverDetailAtom,
} from "@/store/cover.store"
import { useMutation, useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { Cover } from "@/types/cover.types"
import { onError } from "@/components/ui/use-toast"

import { mutations, queries } from "../graphql"

export const useCoverDetail = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const router = useRouter()
  const pathname = usePathname()
  const { userId } = useUser()
  const creating = useRef(false)
  const [createError, setCreateError] = useState("")
  const resetCover = useSetAtom(resetCoverDetailAtom)
  const setCover = useSetAtom(setCoverDetailAtom)
  const setIsFetched = useSetAtom(isCoverAmountsFetchedAtom)

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
        const next = new URLSearchParams(searchParams.toString())
        next.set("id", data.coversAdd._id)
        router.replace(`${pathname}?${next.toString()}`, { scroll: false })
      })
      .catch((error: unknown) =>
        setCreateError(error instanceof Error ? error.message : String(error))
      )
  }, [id, userId, createCover, resetCover, router, pathname, searchParams])

  const { data, loading, error } = useQuery<{ coverDetail: Cover | null }>(
    queries.coverDetail,
    {
      variables: { id },
      fetchPolicy: "network-only",
      skip: !id || id === "create",
      onCompleted(result) {
        const { coverDetail } = result || {}
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

  return {
    id,
    cover: data?.coverDetail ?? null,
    loading: loading || id === "create",
    error: createError || error?.message || "",
  }
}
