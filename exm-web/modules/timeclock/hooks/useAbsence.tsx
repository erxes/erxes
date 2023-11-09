"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useQuery, useSubscription } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"
import { IAbsence, IAbsenceType } from "../types"
import { generateParams, isCurrentUserAdmin } from "../utils"

export interface IUseAbsence {
  loading: boolean
  error: any
  absenceList: IAbsence[]
  absenceTypes: IAbsenceType[]
  absenceTotalCount: number
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

export const useAbsence = (props: Props): IUseAbsence => {
  const currentUser = useAtomValue(currentUserAtom)

  const {
    data: absenceData,
    loading,
    error,
  } = useQuery(queries.requestsMain, {
    variables: {
      ...generateParams(props),
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

  const absenceTypes = (typesData || {}).absenceTypes
    ? (typesData || {}).absenceTypes
    : []

  return {
    absenceList,
    absenceTypes,
    absenceTotalCount,
    loading,
    error,
  }
}
