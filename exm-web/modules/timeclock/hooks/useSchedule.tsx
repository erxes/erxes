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
}

export const useSchedules = (props: Props, scheduleStatus: string) => {
  const currentUser = useAtomValue(currentUserAtom)

  const {
    data: scheduleData,
    loading: mainLoading,
    error: mainError,
  } = useQuery(queries.schedulesMain, {
    variables: {
      ...generateParams(props),
      scheduleStatus,
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

  const {
    data: configsOrder,
    loading: configsOrderLoading,
    error: configsOrderError,
  } = useQuery(queries.scheduleConfigOrder)

  const scheduleConfigOrder = (configsOrder || {}).scheduleConfigOrder
    ? (configsOrder || {}).scheduleConfigOrder
    : {}

  return {
    schedulesList,
    configsList,
    scheduleConfigOrder,
    schedulesTotalCount,
    loading: mainLoading || configsLoading,
  }
}
