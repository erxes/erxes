import { queries } from "@/common/team/graphql"
import { IUser } from "@/modules/auth/types"
import { useQuery } from "@apollo/client"

type IOption = {
  label: string
  value: string
  avatar?: string
  extraValue?: string
}

export interface IUseFeedDetail {
  loading: boolean
  userOptions: IOption[]
  users: IUser[]
}

export const useUsers = ({
  userIds = [],
  searchValue,
  reload,
}: {
  userIds?: string[]
  searchValue?: string
  reload?: boolean
}): IUseFeedDetail => {
  const { data: usersData, loading } = useQuery(queries.users, {
    variables: {
      ids: userIds,
      searchValue,
      excludeIds: reload,
    },
  })

  const { users } = usersData || {}

  const userOptions = users?.map((user: IUser) => {
    const details = user.details || {}

    const label = details.fullName || user.username || user.email
    return { label, value: user._id }
  })

  return {
    loading,
    userOptions,
    users: users || []
  }
}
