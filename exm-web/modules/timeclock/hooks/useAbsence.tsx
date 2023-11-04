"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useQuery, useSubscription } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"
import { IAbsence } from "../types"
import { isCurrentUserAdmin } from "../utils"

export interface IUseAbsence {
  loading: boolean
  error: any
  absenceList: IAbsence[]
  absenceTotalCount: number
}

export const useAbsence = (
  page: number,
  perPage: number,
  startDate: string,
  endDate: string
): IUseAbsence => {
  const currentUser = useAtomValue(currentUserAtom)

  const {
    data: absenceData,
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

  const absenceList = (absenceData || {}).requestsMain
    ? (absenceData || {}).requestsMain.list
    : []

  const absenceTotalCount = (absenceData || {}).requestsMain
    ? (absenceData || {}).requestsMain.totalCount
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
    absenceList,
    absenceTotalCount,
    loading,
    error,
  }
}
