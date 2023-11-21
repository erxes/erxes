import { useSearchParams } from "next/navigation"
import { useQuery, useSubscription } from "@apollo/client"

import { queries, subscriptions } from "../graphql"
import { IChatMessage } from "../types"

export interface IUseChats {
  chatPinnedMessages: IChatMessage[]
}

export const usePinnedChats = (): IUseChats => {
  const searchParams = useSearchParams()

  const id = searchParams.get("id") as string
  const chatPinnedMessagesQuery = useQuery(queries.chatMessages, {
    variables: { chatId: id, isPinned: true, skip: 0 },
  })

  useSubscription(subscriptions.chatMessageInserted, {
    variables: { chatId: id },
    onData: ({ data }) => {
      if (!data) {
        return null
      }
    },
  })

  const chatPinnedMessages =
    chatPinnedMessagesQuery.data && chatPinnedMessagesQuery.data.chatMessages
      ? chatPinnedMessagesQuery.data.chatMessages.list
      : []

  return {
    chatPinnedMessages,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
