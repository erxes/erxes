"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"
import { TimeClockQueryResponse } from "../types"
import { isCurrentUserAdmin } from "../utils"

export interface IUseRequests {
  loading: boolean
  error: any
  requestsList: TimeClockQueryResponse
  requestsTotalCount: number
}

export const useSchedules = (
  page: number,
  perPage: number,
  startDate: string,
  endDate: string,
  scheduleStatus: string
) => {
  const currentUser = useAtomValue(currentUserAtom)

  const {
    data: mainData,
    loading: mainLoading,
    error: mainError,
  } = useQuery(queries.schedulesMain, {
    variables: {
      page,
      perPage,
      startDate,
      endDate,
      isCurrentUserAdmin: isCurrentUserAdmin(currentUser),
      scheduleStatus,
    },
  })

  const schedulesList = (mainData || {}).schedulesMain
    ? (mainData || {}).schedulesMain.list
    : []

  const schedulesTotalCount = (mainData || {}).schedulesMain
    ? (mainData || {}).schedulesMain.totalCount
    : 0

  const {
    data: configsData,
    loading: configsLoading,
    error: configsError,
  } = useQuery(queries.scheduleConfigs)

  const configsList = (configsData || {}).scheduleConfigs
    ? (mainData || {}).scheduleConfigs
    : []

  return {
    schedulesList,
    schedulesTotalCount,
  }
}
