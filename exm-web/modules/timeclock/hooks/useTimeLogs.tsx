"use client"

import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

type Props = {
  startDate: string
  endDate: string
  userId?: string
}

export const useTimeLogs = (props: Props) => {
  // const {
  //   data: logsMain,
  //   loading: logsLoading,
  //   error: logsError,
  // } = useQuery(queries.timelogsMain, {
  //   variables: {
  //     ...props,
  //   },
  // })

  const {
    data: perUser,
    loading,
    error,
  } = useQuery(queries.timeLogsPerUser, {
    variables: {
      ...props,
    },
  })

  const timeLogsPerUser = (perUser || {}).timeLogsPerUser
    ? (perUser || {}).timeLogsPerUser
    : []

  return {
    timeLogsPerUser,
    loading,
    error,
  }
}
