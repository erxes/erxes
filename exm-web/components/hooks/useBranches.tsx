import { queries } from "@/common/team/graphql"
import { IUser } from "@/modules/auth/types"
import { IBranch } from "@/modules/feed/types"
import { useQuery } from "@apollo/client"

type IOption = {
  label: string
  value: string
}

export interface IUseBranches {
  loading: boolean
  branchesOption: IOption[]
}

export const useBranches = ({
  branchIds = [],
  searchValue,
  reload,
}: {
  branchIds?: string[]
  searchValue?: string
  reload?: boolean
}): IUseBranches => {
  const { data: branchesData, loading } = useQuery(queries.branches, {
    variables: {
      ids: branchIds,
      searchValue,
      excludeIds: reload,
    },
  })

  const { branches } = branchesData || {}

  const branchesOption = branches?.map((branch: IBranch) => {
    return { value: branch._id, label: branch.title, userIds: branch.userIds }
  })

  return {
    loading,
    branchesOption,
  }
}
