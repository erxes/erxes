import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { generatePaginationParams } from "@/lib/utils"

import { queries } from "../graphql"

export const useFeedback = ({
  page,
  perPage,
  pipelineId,
}: {
  page?: string
  perPage?: string
  pipelineId: string
}) => {
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
      ...generatePaginationParams({ page, perPage }),
    },
  })

  const {
    data: ticketsCount,
    loading: ticketsCountLoading,
    error: ticketsCountError,
  } = useQuery(queries.ticketsTotalCount, {
    variables: {
      pipelineId,
      userIds: [currentUser?._id],
    },
  })

  const stage = (stagesDate || []).stages ? (stagesDate || []).stages[0] : []

  const tickets = (ticketsDate || []).tickets ? (ticketsDate || []).tickets : []

  const totalCount = ticketsCount ? ticketsCount.ticketsTotalCount : 0

  return {
    stage,
    tickets,
    totalCount,
    loading: stagesLoading || ticketsLoading || ticketsCountLoading,
  }
}
