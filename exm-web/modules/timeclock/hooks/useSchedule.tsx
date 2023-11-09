"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"
import { TimeClockQueryResponse } from "../types"
import { generateParams } from "../utils"

export interface IUseRequests {
  loading: boolean
  error: any
  requestsList: TimeClockQueryResponse
  requestsTotalCount: number
}

type Props = {
  page?: number
  perPage?: number
  startDate: string
  endDate: string
  userIds?: string[]
  searchValue?: string
  scheduleStatus: string
}

export const useSchedules = (props: Props) => {
  const currentUser = useAtomValue(currentUserAtom)

  const {
    data: scheduleData,
    loading: mainLoading,
    error: mainError,
  } = useQuery(queries.schedulesMain, {
    variables: {
      ...generateParams(props),
    },
  })

  const schedulesList = (scheduleData || {}).schedulesMain
    ? (scheduleData || {}).schedulesMain.list
    : []

  const schedulesTotalCount = (scheduleData || {}).schedulesMain
    ? (scheduleData || {}).schedulesMain.totalCount
    : 0

  const {
    data: configsData,
    loading: configsLoading,
    error: configsError,
  } = useQuery(queries.scheduleConfigs)

  const configsList = (configsData || {}).scheduleConfigs
    ? (configsData || {}).scheduleConfigs
    : []

  return {
    schedulesList,
    configsList,
    schedulesTotalCount,
  }
}
