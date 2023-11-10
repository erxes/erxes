import { queries } from "@/common/team/graphql"
import { IUser } from "@/modules/auth/types"
import { useQuery } from "@apollo/client"

export interface IUseUserDetail {
  loading: boolean
  userDetail: IUser
}

export const useUserDetail = ({ userId }: { userId: string }): IUseUserDetail => {
  const { data, loading } = useQuery(queries.userDetail, {
    variables: {
      _id: userId,
    },
  })

  const userDetail = data ? data.userDetail : {}

  return {
    loading,
    userDetail: userDetail || {},
  }
}
