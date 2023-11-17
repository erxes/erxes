import React from "react"
import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useCategory = ({ id }: { id: string }) => {
  const {
    data: categoryDate,
    loading: categoryLoading,
    error: categoryError,
  } = useQuery(queries.categoryDetailQuery, {
    variables: {
      _id: "rWgiSJ6LPMFijp3SP",
    },
  })

  const category = (categoryDate || {}).knowledgeBaseCategoryDetail
    ? (categoryDate || {}).knowledgeBaseCategoryDetail
    : {}

  return {
    category,
    loading: categoryLoading,
  }
}
