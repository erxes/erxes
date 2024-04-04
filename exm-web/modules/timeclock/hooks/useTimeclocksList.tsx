"use client"

import { useQuery } from "@apollo/client"

import { queries } from "../graphql"
import { ITimeclock } from "../types"
import { generateParams } from "../utils"

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
  userIds?: string[]
  searchValue?: string
}

export const useTimeclocksList = (props: Props): IUseTimeClocksList => {
  const {
    data,
    loading: timeclocksLoading,
    error: timeclocksError,
  } = useQuery(queries.timeclocksMain, {
    variables: {
      ...generateParams(props),
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
