import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

export const useArticle = ({
  searchValue,
  id,
  topicId,
}: {
  searchValue?: string
  id: string
  topicId?: string
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
