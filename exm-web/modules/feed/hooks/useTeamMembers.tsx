import { useQuery } from "@apollo/client"

import { queries } from "../graphql"
import { IBranch, IDepartment, UnitsMainQueryResponse } from "../types"

type IOption = {
  label: string
  value: string
  avatar?: string
  extraValue?: string
}

export interface IUseFeedDetail {
  departments: IDepartment[]
  branches: IBranch[]
  unitsMain: UnitsMainQueryResponse
  loading: boolean
  departmentOptions: IOption[]
  branchOptions: IOption[]
  unitOptions: IOption[]
}

export const useTeamMembers = ({
  departmentIds = [],
  unitIds = [],
  branchIds = [],
  departmentSearchValue,
  unitSearchValue,
  branchSearchValue,
  reload,
}: {
  departmentIds?: string[]
  unitIds?: string[]
  branchIds?: string[]
  departmentSearchValue?: string
  unitSearchValue?: string
  branchSearchValue?: string
  reload?: boolean
}): IUseFeedDetail => {
  const { data: departmentsData, loading: loadingDepartments } = useQuery(
    queries.departments,
    {
      variables: {
        ids: departmentIds,
        searchValue: departmentSearchValue,
        excludeIds: reload,
      },
    }
  )
  const { data: branchesData, loading: loadingBranches } = useQuery(
    queries.branches,
    {
      variables: {
        ids: branchIds,
        searchValue: branchSearchValue,
        excludeIds: reload,
      },
    }
  )
  const { data: unitsData, loading: loadingUnits } = useQuery(
    queries.unitsMain,
    {
      variables: {
        ids: unitIds,
        searchValue: unitSearchValue,
        excludeIds: reload,
      },
    }
  )

  const { departments } = departmentsData || {}
  const { branches } = branchesData || {}
  const { unitsMain } = unitsData || {}

  let loading = true

  if (!loadingBranches && !loadingDepartments && !loadingUnits) {
    loading = false
  }

  const departmentOptions = departments?.map((department: any) => {
    return { label: department.title, value: department._id }
  })
  const branchOptions = branches?.map((branch: any) => {
    return { label: branch.title, value: branch._id }
  })
  const unitOptions = unitsMain?.list?.map((units: any) => {
    return { label: units.title, value: units._id }
  })

  return {
    departments,
    branches,
    unitsMain,
    loading,
    departmentOptions,
    branchOptions,
    unitOptions,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20
