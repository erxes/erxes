"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useQuery, useSubscription } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"
import { IAbsence } from "../types"
import { isCurrentUserAdmin } from "../utils"

export interface IUseRequests {
  loading: boolean
  error: any
  requestsList: IAbsence[]
  requestsTotalCount: number
}

export const useRequests = (
  page: number,
  perPage: number,
  startDate: string,
  endDate: string
): IUseRequests => {
  const currentUser = useAtomValue(currentUserAtom)

  const {
    data: mainData,
    loading,
    error,
  } = useQuery(queries.requestsMain, {
    variables: {
      page,
      perPage,
      startDate,
      endDate,
      isCurrentUserAdmin: isCurrentUserAdmin(currentUser),
    },
  })

  const requestsList = (mainData || {}).requestsMain
    ? (mainData || {}).requestsMain.list
    : []

  const requestsTotalCount = (mainData || {}).requestsMain
    ? (mainData || {}).requestsMain.totalCount
    : 0

  const {
    data: typesData,
    loading: typesLoading,
    error: typesError,
  } = useQuery(queries.absenceTypes)

  const typesList = (typesData || {}).absenceTypes
    ? (typesData || {}).absenceTypes
    : []

  return {
    requestsList,
    requestsTotalCount,
    loading,
    error,
  }
}
