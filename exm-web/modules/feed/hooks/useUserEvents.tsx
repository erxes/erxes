import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export interface IUsePosts {
  loading: boolean
  totalCount: number
  events: any
}

export const useUserEvents = ({userId}:{userId: string}): IUsePosts => {
  const { data, loading, } = useQuery(queries.userEvents, {
    variables: {
      userId
    },
  })

  const events = (data || {}).exmFeedEventsByUser || []
  const totalCount = (data || {}).exmFeed ? (data || {}).exmFeed.totalCount : 0
  
  return {
    loading,
    events,
    totalCount,
  }
}
