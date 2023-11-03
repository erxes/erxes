"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useQuery, useSubscription } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"
import { ReportsQueryResponse } from "../types"
import { isCurrentUserAdmin } from "../utils"

export interface IUseRequests {
  loading: boolean
  error: any
  reportsList: ReportsQueryResponse
  reportsTotalCount: number
}

export const useReports = (
  page: number,
  perPage: number,
  startDate: string,
  endDate: string
): IUseRequests => {
  const currentUser = useAtomValue(currentUserAtom)

  const { data, loading, error } = useQuery(queries.timeclockReports, {
    variables: {
      page,
      perPage,
      startDate,
      endDate,
      isCurrentUserAdmin: isCurrentUserAdmin(currentUser),
    },
  })

  const reportsList = (data || {}).timeclockReports
    ? (data || {}).timeclockReports.list
    : []

  const reportsTotalCount = (data || {}).timeclockReports
    ? (data || {}).requestsMain.totalCount
    : 0

  return {
    reportsList,
    reportsTotalCount,
    loading,
    error,
  }
}
