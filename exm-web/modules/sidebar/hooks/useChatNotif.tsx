"use client"

import { usePathname } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/types"
import { useQuery, useSubscription } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries, subscriptions } from "../../chat/graphql"

export interface IUseChats {
  unreadCount: number
  refetch: () => void
}

export const useChatNotif = (): IUseChats => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const pathname = usePathname()

  const { data, loading, refetch } = useQuery(queries.getUnreadChatCount, {})
  const { refetch: refetchChat } = useQuery(queries.chats, {
    variables: { limit: 1 },
  })

  let unreadCount = 0

  if (!loading) {
    unreadCount = data?.getUnreadChatCount || 0
  }

  useSubscription(subscriptions.chatUnreadCountChanged, {
    variables: { userId: currentUser._id },
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      if (!data) {
        return null
      }

      if (!pathname.includes("/chats")) {
        const audio = new Audio("/sound/notify.mp3")
        audio.play()
      }

      refetch()
      refetchChat()
    },
  })

  return {
    unreadCount,
    refetch,
  }
}
