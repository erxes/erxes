"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"
import { ITimeclock } from "../types"
import { isCurrentUserAdmin } from "../utils"

export interface IUseTimeClocks {
  loading: boolean
  error: any
  timelocksList: ITimeclock[]
  timelocksTotalCount: number
}

export const useTimeclocks = (
  page: number,
  perPage: number,
  startDate: string,
  endDate: string
): IUseTimeClocks => {
  const currentUser = useAtomValue(currentUserAtom)
  isCurrentUserAdmin(currentUser)

  const { data, loading, error } = useQuery(queries.timeclocksMain, {
    variables: {
      page,
      perPage,
      startDate,
      endDate,
      isCurrentUserAdmin: isCurrentUserAdmin(currentUser),
    },
  })

  const timelocksList = (data || {}).timeclocksMain
    ? (data || {}).timeclocksMain.list
    : []

  const timelocksTotalCount = (data || {}).timeclocksMain
    ? (data || {}).timeclocksMain.totalCount
    : 0

  return {
    timelocksList,
    timelocksTotalCount,
    loading,
    error,
  }
}
