"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IDepartment, IUser } from "@/modules/auth/types"
import { IBranch } from "@/modules/feed/types"
import { useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries as exmQuery } from "../../../common/team/graphql"
import { queries } from "../graphql"
import { IScheduleConfig, ITimeclock } from "../types"
import { generateParams, isCurrentUserAdmin } from "../utils"

export interface IUseTimeClocksList {
  loading: boolean
  timeclocksMainList: ITimeclock[]
  timeclocksMainTotalCount: number
}

type Props = {
  page?: number
  perPage?: number
  startDate: string
  endDate: string
  branchIds?: string[]
  departmentIds?: string[]
  userIds?: string[]
  searchValue?: string
}

export const useTimeclocksList = (props: Props): IUseTimeClocksList => {
  const currentUser = useAtomValue(currentUserAtom)
  isCurrentUserAdmin(currentUser)

  const {
    data,
    loading: timeclocksLoading,
    error: timeclocksError,
  } = useQuery(queries.timeclocksMain, {
    variables: {
      ...generateParams(props),
      isCurrentUserAdmin: isCurrentUserAdmin(currentUser),
    },
  })

  const timeclocksMainList = (data || {}).timeclocksMain
    ? (data || {}).timeclocksMain.list
    : []

  const timeclocksMainTotalCount = (data || {}).timeclocksMain
    ? (data || {}).timeclocksMain.totalCount
    : 0

  return {
    timeclocksMainList,
    timeclocksMainTotalCount,
    loading: timeclocksLoading,
  }
}
