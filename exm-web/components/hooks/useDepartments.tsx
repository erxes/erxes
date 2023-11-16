import { queries } from "@/common/team/graphql"
import { IDepartment } from "@/modules/auth/types"
import { useQuery } from "@apollo/client"

type IOption = {
  label: string
  value: string
}

export interface IUseDepartments {
  loading: boolean
  departmentsOption: IOption[]
}

export const useDepartments = ({
  departmentIds = [],
  searchValue,
  reload,
}: {
  departmentIds?: string[]
  searchValue?: string
  reload?: boolean
}): IUseDepartments => {
  const { data: branchesData, loading } = useQuery(queries.departments, {
    variables: {
      ids: departmentIds,
      searchValue,
      excludeIds: reload,
    },
  })

  const { departments } = branchesData || {}

  const departmentsOption = departments?.map((department: IDepartment) => {
    return {
      value: department._id,
      label: department.title,
      userIds: department.userIds,
    }
  })

  return {
    loading,
    departmentsOption,
  }
}
