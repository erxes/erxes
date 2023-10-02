"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/types"
import { useQuery, useSubscription } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries, subscriptions } from "../graphql"

export interface IUseChats {
  loading: boolean
  chats: any
  pinnedChats: any
  chatsCount: number
  handleLoadMore: () => void
  refetch: () => void
}

export const useChats = ({
  searchValue,
}: {
  searchValue?: string
}): IUseChats => {
  const {
    data,
    loading: chatsLoading,
    fetchMore,
    refetch: refetchChat,
  } = useQuery(queries.chats, {
    variables: { limit: 20, searchValue },
  })
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  let loading = true

  const {
    data: pinnedChatsData,
    loading: pinnedChatsLoading,
    refetch: refetchPinnedChat,
  } = useQuery(queries.chatsPinned, {
    variables: { limit: 20 },
  })

  const handleLoadMore = () => {
    if (loading) {
      return
    }
    const chats = (data || {}).chats ? (data || {}).chats.list : []
    const chatLength = chats.length || 0

    fetchMore({
      variables: {
        skip: chatLength,
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) {
          return prev
        }

        const fetchedChats = fetchMoreResult.chats.list || []

        const prevChats = prev.chats.list || []

        if (fetchedChats) {
          return {
            ...prev,
            chats: {
              ...prev.chats,
              list: [...prevChats, ...fetchedChats],
            },
          }
        }
      },
    })
  }

  useSubscription(subscriptions.chatUnreadCountChanged, {
    variables: { userId: currentUser._id },
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      if (!data) {
        return null
      }

      refetch()
    },
  })

  if (!chatsLoading && !pinnedChatsLoading) {
    loading = false
  }

  const chats = (data || {}).chats ? (data || {}).chats.list : []
  const pinnedChats = (pinnedChatsData || {}).chatsPinned
    ? (pinnedChatsData || {}).chatsPinned.list
    : []
  const chatsCount = (data || {}).chats ? (data || {}).chats.totalCount : 0

  const refetch = () => {
    refetchChat()
    refetchPinnedChat()
  }

  return {
    loading,
    chats,
    pinnedChats,
    chatsCount,
    handleLoadMore,
    refetch,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
