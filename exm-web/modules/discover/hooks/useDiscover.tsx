import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useDiscover = ({ id }: { id: string }) => {
  const {
    data: data,
    loading,
    error,
  } = useQuery(queries.getKbTopicQuery, {
    variables: {
      _id: id,
    },
  })

  const topics = (data || {}).clientPortalKnowledgeBaseTopicDetail
    ? (data || {}).clientPortalKnowledgeBaseTopicDetail
    : {}

  return {
    topics,
    loading,
    error,
  }
}
