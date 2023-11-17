import React from "react"
import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useDiscover = ({ id }: { id: string }) => {
  const {
    data: configDate,
    loading: configLoading,
    error: configError,
  } = useQuery(queries.clientPortalGetConfig)

  const {
    data: topicDate,
    loading: topicLoading,
    error: topicError,
  } = useQuery(queries.getKbTopicQuery, {
    variables: {
      _id: id || "fsaoY2qwDMpaEddPQ",
    },
  })

  const config = (configDate || {}).clientPortalGetConfigByDomain
    ? (configDate || {}).clientPortalGetConfigByDomain
    : {}

  const topic = (topicDate || {}).clientPortalKnowledgeBaseTopicDetail
    ? (topicDate || {}).clientPortalKnowledgeBaseTopicDetail
    : {}

  return {
    config,
    topic,
    loading: configLoading || topicLoading,
  }
}
