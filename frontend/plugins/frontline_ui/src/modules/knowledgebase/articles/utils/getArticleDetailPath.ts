import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';

const ARTICLE_LIST_PATH = /^\/frontline\/knowledgebase\/([^/]+)\/articles/;

export const getArticleDetailPath = (articleId: string, pathname: string) => {
  const topicId = ARTICLE_LIST_PATH.exec(pathname)?.[1];

  return topicId
    ? `${KNOWLEDGE_BASE_PATH}/${topicId}/articles/${articleId}`
    : `${KNOWLEDGE_BASE_PATH}/articles/${articleId}`;
};
