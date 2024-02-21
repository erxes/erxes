import { useSearchParams } from "next/navigation"
import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export interface IUseSharedMedia {
  loading: boolean
  sharedMedia: any
}

export const useSharedMedia = (): IUseSharedMedia => {
  const searchParams = useSearchParams()

  const id = searchParams.get("id") as string

  const { data, loading } = useQuery(queries.sharedMedia, {
    variables: { chatId : id },
    skip: !id,
    fetchPolicy: "network-only",
  })

  const sharedMedia = data ? (data || {}).chatMessageAttachments?.list : []

  return {
    loading,
    sharedMedia,
  }
}
