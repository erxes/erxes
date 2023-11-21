import React from "react"
import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useDiscover = ({ id }: { id: string }) => {
  const {
    data: topicDate,
    loading: topicLoading,
    error: topicError,
  } = useQuery(queries.getKbTopicQuery, {
    variables: {
      _id: id,
    },
  })

  const topic = (topicDate || {}).clientPortalKnowledgeBaseTopicDetail
    ? (topicDate || {}).clientPortalKnowledgeBaseTopicDetail
    : {}

  return {
    topic,
    loading: topicLoading,
    error: topicError,
  }
}
