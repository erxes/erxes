import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useArticles = ({
  searchValue,
  topicId,
  categoryId,
}: {
  searchValue?: string
  topicId?: string
  categoryId?: string
}) => {
  const variables = {
    ...(searchValue && { searchValue }),
    ...(topicId && { topicId }),
    ...(categoryId && { categoryIds: [categoryId] }),
  }

  const { data, loading, error } = useQuery(queries.articlesQuery, {
    variables,
  })

  const articles = (data || {}).clientPortalKnowledgeBaseArticles
    ? (data || {}).clientPortalKnowledgeBaseArticles
    : {}
  return {
    articles,
    loading,
  }
}
