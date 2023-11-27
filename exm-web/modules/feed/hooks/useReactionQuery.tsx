import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export interface IReactionDetail {
  loading: boolean
  loadingReactedUsers: boolean
  emojiCount: number
  emojiReactedUser: string[]
}

export const useReactionQuery = ({
  feedId,
}: {
  feedId: string
}): IReactionDetail => {
  const { data, loading } = useQuery(queries.emojiCount, {
    variables: { contentId: feedId, contentType: "exmFeed", type: "heart" },
  })

  const { data: emojiReactedUsersData, loading: loadingReactedUsers } =
    useQuery(queries.emojiReactedUsers, {
      variables: { contentId: feedId, contentType: "exmFeed", type: "heart" },
    })

  const emojiCount = (data || {}).emojiCount || 0
  const emojiReactedUser = (emojiReactedUsersData || {}).emojiReactedUsers || []

  return {
    loading,
    loadingReactedUsers,
    emojiCount,
    emojiReactedUser,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
