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

  const chatMessagesQuery = useQuery(queries.chatMessages, {
    variables: { chatId: id, skip: 0, limit: 30 },
  })

  useEffect(() => {
    chatMessagesQuery.refetch()
  }, [id])

  const [sendMessageMutation] = useMutation(mutations.chatMessageAdd, {
    update(cache, { data: updateData }: any) {
      const messagesQuery = queries.chatMessages

      const chatMessageAdd = updateData.chatMessageAdd
        ? updateData.chatMessageAdd
        : updateData

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

          const newData = { ...messages } as any

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
          seenList: [
            {
              lastSeenMessageId: "temp-d",
              user: { _id: "", details: { avatar: "" } },
            },
          ],
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
    onData: ({ data }) => {
      if (!data) {
        return null
      }

      chatMessagesQuery.fetchMore({})
    },
  })

  const handleLoadMore = () => {
    const chatLength = chatMessagesQuery.data.chatMessages.list.length || 0

    chatMessagesQuery.fetchMore({
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

  const chatMessages =
    chatMessagesQuery.data && chatMessagesQuery.data.chatMessages
      ? chatMessagesQuery.data.chatMessages.list
      : []

  const messagesTotalCount =
    chatMessagesQuery.data && chatMessagesQuery.data.chatMessages
      ? chatMessagesQuery.data.chatMessages.totalCount
      : 0

  return {
    loading: chatMessagesQuery.loading,
    chatMessages,
    error: chatMessagesQuery.error,
    handleLoadMore,
    sendMessage,
    messagesTotalCount,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
