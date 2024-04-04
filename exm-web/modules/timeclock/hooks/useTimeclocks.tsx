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

export interface IUseTimeClocks {
  loading: boolean
  branchesList: IBranch[]
  departmentsList: IDepartment[]
  scheduleConfigsList: IScheduleConfig[]
}

type Props = {
  page?: number
  perPage?: number
  startDate: string
  endDate: string
  branchIds?: string[]
  departmentIds?: string[]
  userIds?: string[]
}

export const useTimeclocks = ({
  page,
  perPage,
  startDate,
  endDate,
  branchIds,
  departmentIds,
  userIds,
  searchValue,
}: {
  page?: number
  perPage?: number
  startDate: string
  endDate: string
  branchIds?: string[]
  departmentIds?: string[]
  userIds?: string[]
  searchValue?: string
}): IUseTimeClocks => {
  const currentUser = useAtomValue(currentUserAtom)
  isCurrentUserAdmin(currentUser)

  const {
    data: branches,
    loading: branchesLoading,
    error: branchesError,
  } = useQuery(exmQuery.branches, {
    variables: {
      searchValue,
    },
    skip: !isCurrentUserAdmin(currentUser),
  })

  const {
    data: departments,
    loading: departmentsLoading,
    error: departmentsError,
  } = useQuery(exmQuery.departments, {
    variables: {
      searchValue,
    },
    skip: !isCurrentUserAdmin(currentUser),
  })

  const {
    data: scheduleConfigs,
    loading: scheduleConfigsLoading,
    error: scheduleConfigsError,
  } = useQuery(queries.scheduleConfigs)

  const branchesList = (branches || {}).branches
    ? (branches || {}).branches
    : []

  const departmentsList = (departments || {}).departments
    ? (departments || {}).departments
    : []

  const scheduleConfigsList = (scheduleConfigs || {}).scheduleConfigs
    ? (scheduleConfigs || {}).scheduleConfigs
    : []

  return {
    branchesList,
    departmentsList,
    scheduleConfigsList,
    loading: branchesLoading || departmentsLoading || scheduleConfigsLoading,
  }
}
