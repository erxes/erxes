import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useArticles = ({
  searchValue,
  id,
  topicId,
  categoryIds,
}: {
  searchValue?: string
  id?: string
  topicId?: string
  categoryIds?: string[]
}) => {
  const {
    data: articlesDate,
    loading: articlesLoading,
    error: articlesError,
  } = useQuery(queries.articlesQuery, {
    variables: {
      searchValue,
      _id: id,
      topicId,
      categoryIds,
    },
  })
  const articles = (articlesDate || {}).clientPortalKnowledgeBaseArticles
    ? (articlesDate || {}).clientPortalKnowledgeBaseArticles
    : {}
  return {
    articles,
    loading: articlesLoading,
  }
}
