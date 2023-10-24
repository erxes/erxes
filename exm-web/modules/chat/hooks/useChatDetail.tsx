import { useSearchParams } from "next/navigation"
import { useQuery } from "@apollo/client"

import { queries } from "../graphql"
import { IChat } from "../types"

export interface IUseChats {
  loading: boolean
  chatDetail: IChat
}

export const useChatDetail = (): IUseChats => {
  const searchParams = useSearchParams()

  const id = searchParams.get("id") as string

  const { data, loading } = useQuery(queries.chatDetail, {
    variables: { id },
    skip: !id,
    fetchPolicy: "network-only",
  })

  const chatDetail = data ? (data || {}).chatDetail : {}

  return {
    loading,
    chatDetail,
  }
}
