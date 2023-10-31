import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useMutation, useQuery, useSubscription } from "@apollo/client"
import { useAtomValue } from "jotai"

import { mutations, queries, subscriptions } from "../graphql"
import { IChatMessage } from "../types"

export interface IUseChats {
  loading: boolean
  chatMessages: IChatMessage[]
  error: any
  handleLoadMore: () => void
  sendMessage: ({
    content,
    relatedId,
    attachments,
  }: {
    content?: string
    relatedId?: string
    attachments?: string[]
  }) => void
  messagesTotalCount: number
}

export const useChatMessages = (): IUseChats => {
  const searchParams = useSearchParams()
  const currentUser = useAtomValue(currentUserAtom)

  const id = searchParams.get("id") as string

  const { data, loading, fetchMore, error, refetch } = useQuery(
    queries.chatMessages,
    {
      variables: { chatId: id, skip: 0, limit: 30 },
    }
  )

  useEffect(() => {
    refetch()
  }, [id])

  const [sendMessageMutation] = useMutation(mutations.chatMessageAdd, {
    update(cache, { data }: any) {
      let messagesQuery = queries.chatMessages

      const chatMessageAdd = data.chatMessageAdd ? data.chatMessageAdd : data

      const selector = {
        query: messagesQuery,
        variables: { chatId: id, skip: 0, limit: 30 },
      }

      try {
        cache.updateQuery(selector, (data) => {
          const key = "chatMessages"
          const messages = data ? data[key] : []

          if (messages?.list?.find((m: any) => m._id === chatMessageAdd._id)) {
            return
          }

          const newData = { ...messages }

          newData.list = [chatMessageAdd, ...newData.list]

          return { chatMessages: newData }
        })
      } catch (e) {
        console.log(e)
      }
    },

    refetchQueries: ["chatMessages", "chats"],
  })

  const sendMessage = ({
    content,
    relatedId,
    attachments,
  }: {
    content?: string
    relatedId?: string
    attachments?: string[]
  }) => {
    sendMessageMutation({
      variables: { chatId: id, content, relatedId, attachments },

      optimisticResponse: {
        __typename: "Mutation",
        chatMessageAdd: {
          __typename: "ChatMessage",
          _id: "temp-id",
          chatId: id,
          content,
          createdUser: currentUser,
          relatedId,
          attachments,
          lastSeenMessageId: { lastMessageId: "temp-d" },
          seenList: { lastSeenMessageId: "temp-d" },
          relatedMessage: null,
          createdAt: new Date(),
          mentionedUserIds: [],
          isPinned: false,
        },
      },
    }).catch((e) => console.log(e))
  }

  useSubscription(subscriptions.chatMessageInserted, {
    variables: { chatId: id },
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      if (!data) {
        return null
      }

      fetchMore({})
    },
  })

  const handleLoadMore = () => {
    const chatLength = data.chatMessages.list.length || 0

    fetchMore({
      variables: {
        skip: chatLength,
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) {
          return prev
        }

        const fetchedChatMessages = fetchMoreResult.chatMessages.list || []

        const prevChatMessages = prev.chatMessages.list || []

        if (fetchedChatMessages) {
          return {
            ...prev,
            chatMessages: {
              ...prev.chatMessages,
              list: [...prevChatMessages, ...fetchedChatMessages],
            },
          }
        }
      },
    })
  }

  const chatMessages = (data || {}).chatMessages
    ? (data || {}).chatMessages.list
    : []

  const messagesTotalCount = (data || {}).chatMessages
    ? (data || {}).chatMessages.totalCount
    : 0

  return {
    loading,
    chatMessages,
    error,
    handleLoadMore,
    sendMessage,
    messagesTotalCount,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
