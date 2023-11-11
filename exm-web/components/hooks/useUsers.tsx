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
  usersTotalCount: number
  handleLoadMore: () => void
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
  const { data: usersData, loading, fetchMore } = useQuery(queries.users, {
    variables: {
      ids: userIds,
      searchValue,
      excludeIds: reload,
      page: 1,
      perPage: 20,
    },
  })

  const { data: usersTotalCountData } = useQuery(queries.usersTotalCount, {
    variables: {
      ids: userIds,
      searchValue,
      excludeIds: reload,
    },
  })

  const handleLoadMore = () => {
    const usersLength = usersData.users.length || 0

    fetchMore({
      variables: {
        page: Math.round(usersLength / 20 + 1),
        perPage: 20,
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) {
          return prev
        }

        const fetchedUsers = fetchMoreResult.users || []

        const prevUsers = prev.users || []

        if (fetchedUsers) {
          return {
            users: [...prevUsers, ...fetchedUsers],
          }
        }
      },
    })
  }

  const { users } = usersData || {}
  const { usersTotalCount } = usersTotalCountData || {}

  const userOptions = users?.map((user: IUser) => {
    const details = user.details || {}

    const label = details.fullName || user.username || user.email
    return { label, value: user._id }
  })

  return {
    loading,
    userOptions,
    users: users || [],
    usersTotalCount,
    handleLoadMore
  }
}
