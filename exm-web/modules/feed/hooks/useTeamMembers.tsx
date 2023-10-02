import { useQuery } from "@apollo/client"

import { queries } from "../graphql"
import { IBranch, IDepartment, UnitsMainQueryResponse } from "../types"

export interface IUseFeedDetail {
  departments: IDepartment[]
  branches: IBranch[]
  unitsMain: UnitsMainQueryResponse
  loading: boolean
}

export const useTeamMembers = (): IUseFeedDetail => {
  const { data: departmentsData, loading: loadingDepartments } = useQuery(
    queries.departments
  )
  const { data: branchesData, loading: loadingBranches } = useQuery(
    queries.branches
  )
  const { data: unitsData, loading: loadingUnits } = useQuery(queries.unitsMain)

  const { departments } = departmentsData || {}
  const { branches } = branchesData || {}
  const { unitsMain } = unitsData || {}

  let loading = true

  if (!loadingBranches && !loadingDepartments && !loadingUnits) {
    loading = false
  }

  return {
    departments,
    branches,
    unitsMain,
    loading,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
