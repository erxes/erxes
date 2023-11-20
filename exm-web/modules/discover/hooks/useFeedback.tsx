import React from "react"
import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useFeedback = ({ pipelineId }: { pipelineId: string }) => {
  const {
    data: stagesDate,
    loading: stagesLoading,
    error: stagesError,
  } = useQuery(queries.stages, {
    variables: {
      pipelineId,
    },
  })

  const {
    data: ticketsDate,
    loading: ticketsLoading,
    error: ticketsError,
  } = useQuery(queries.tickets, {
    variables: {
      pipelineId,
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
