import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useArticle = (id: string) => {
  const {
    data: articleDate,
    loading: articleLoading,
    error: articleError,
  } = useQuery(queries.articleDetailQuery, {
    variables: {
      _id: id,
    },
  })
  const article = (articleDate || {}).knowledgeBaseArticleDetail
    ? (articleDate || {}).knowledgeBaseArticleDetail
    : {}
  return {
    article,
    loading: articleLoading,
  }
}
