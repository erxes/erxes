import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSubscription } from "@apollo/client"

import { subscriptions } from "../graphql"

export interface IUseTyping {
  typing: string
}

export const useTyping = (): IUseTyping => {
  const searchParams = useSearchParams()
  const [typing, setTyping] = useState("")
  const id = searchParams.get("id") as string

  useSubscription(subscriptions.chatTypingStatusChanged, {
    variables: { chatId: id },
    onSubscriptionData: (subscriptionData: any) => {
      if (!subscriptionData) {
        return null
      }

      setTyping(
        subscriptionData.subscriptionData.data.chatTypingStatusChanged.userId
      )
    },
  })

  return {
    typing,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
