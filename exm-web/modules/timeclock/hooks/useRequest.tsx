"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/types"
import { useQuery, useSubscription } from "@apollo/client"
import { useAtomValue } from "jotai"

import { queries } from "../graphql"
import { IAbsence } from "../types"

export interface IUseRequests {
  loading: boolean
  error: any
  requestsList: IAbsence[]
  requestsTotalCount: number
}

export const useRequests = (
  page: number,
  perPage: number,
  startDate: Date,
  endDate: Date
): IUseRequests => {
  const currentUser = useAtomValue(currentUserAtom)
  const isCurrentUserAdmin = currentUser?.isAdmin

  const { data, loading, error } = useQuery(queries.requestsMain, {
    variables: { page, perPage, startDate, endDate, isCurrentUserAdmin },
  })

  const requestsList = (data || {}).requestsMain
    ? (data || {}).requestsMain.list
    : []
  const requestsTotalCount = (data || {}).requestsMain
    ? (data || {}).requestsMain.totalCount
    : []

  return {
    loading,
    requestsList,
    error,
    requestsTotalCount,
  }
}
