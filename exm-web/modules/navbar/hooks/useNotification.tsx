import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useMutation, useQuery, useSubscription } from "@apollo/client"
import { useAtomValue } from "jotai"

import { mutations, queries, subscriptions } from "../graphql"
import { INotification } from "../types"

export interface IUseNotifications {
  loading: boolean
  notifications: INotification[]
  notificationsCount: number
  unreadCount: number
  handleLoadMore: () => void
  markAsRead: (_ids: string[]) => void
}

export const useNotification = (): IUseNotifications => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const { data, loading, fetchMore } = useQuery(queries.notifications, {
    variables: {
      page: 1,
      perPage: 5,
      contentTypes: ["exmFeed"],
    },
  })

  const totalCountQuery = useQuery(queries.notificationCounts, {
    variables: { contentTypes: ["exmFeed"] },
  })
  const unreadCountQuery = useQuery(queries.notificationCounts, {
    variables: { requireRead: true, contentTypes: ["exmFeed"] },
  })

  const [markAsReadMutation] = useMutation(mutations.markAsRead)

  const handleLoadMore = () => {
    const notificationsLength = data.notifications.length || 0

    fetchMore({
      variables: {
        page: notificationsLength / 5 + 1,
        perPage: 5,
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) {
          return prev
        }

        const fetchedNotifications = fetchMoreResult.notifications || []

        const prevNotifications = prev.notifications || []

        if (fetchedNotifications) {
          return {
            notifications: [...prevNotifications, ...fetchedNotifications],
          }
        }
      },
    })
  }

  useSubscription(subscriptions.notificationSubscription, {
    variables: { userId: currentUser._id },
    onData: (subscriptionData: any) => {
      if (!subscriptionData) {
        return null
      }
      fetchMore({})
      unreadCountQuery.fetchMore({})
    },
  })

  useSubscription(subscriptions.notificationRead, {
    variables: { userId: currentUser._id },
    onData: (subscriptionData: any) => {
      if (!subscriptionData) {
        return null
      }
      fetchMore({})
      unreadCountQuery.fetchMore({})
    },
  })

  const markAsRead = (_ids: string[]) => {
    markAsReadMutation({
      variables: { _ids },
    })
  }
  const notifications = data ? data.notifications : ([] as INotification[])
  const notificationsCount = totalCountQuery.data
    ? totalCountQuery.data.notificationCounts
    : 0
  const unreadCount = unreadCountQuery.data
    ? unreadCountQuery.data.notificationCounts
    : 0

  return {
    loading,
    notifications,
    notificationsCount,
    unreadCount,
    markAsRead,
    handleLoadMore,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
