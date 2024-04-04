import { queries } from "../graphql"
import { useQuery } from "@apollo/client"

export interface IUseUserDetail {
  loading: boolean
  exm: any
}

export const useExm = (): IUseUserDetail => {
  const { data, loading } = useQuery(queries.exm)

  const exm = data ? data.exmGet : {}

  return {
    loading,
    exm
  }
}
