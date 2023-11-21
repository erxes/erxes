import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"

export const useFeedback = ({ pipelineId }: { pipelineId: string }) => {
  const currentUser = useAtomValue(currentUserAtom)

  const {
    data: stagesDate,
    loading: stagesLoading,
    error: stagesError,
  } = useQuery(queries.stages, {
    variables: {
      pipelineId,
      userIds: [currentUser?._id],
    },
  })

  const {
    data: ticketsDate,
    loading: ticketsLoading,
    error: ticketsError,
  } = useQuery(queries.tickets, {
    variables: {
      pipelineId,
      userIds: [currentUser?._id],
    },
  })

  const stages = (stagesDate || []).stages ? (stagesDate || []).stages : []

  const tickets = (ticketsDate || []).tickets ? (ticketsDate || []).tickets : []

  return {
    stages,
    tickets,
    loading: stagesLoading || ticketsLoading,
  }
}
