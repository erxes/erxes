import { enqueueAiKnowledgeSourceRefreshJob } from 'erxes-api-shared/utils';
import { FRONTLINE_KNOWLEDGEBASE_ARTICLE_SOURCE_KEY } from '@/knowledgebase/meta/automations';

export const refreshKnowledgeArticle = async ({
  subdomain,
  articleId,
}: {
  subdomain: string;
  articleId: string;
}) => {
  try {
    await enqueueAiKnowledgeSourceRefreshJob({
      subdomain,
      source: {
        pluginName: 'frontline',
        moduleName: 'knowledgebase',
        key: FRONTLINE_KNOWLEDGEBASE_ARTICLE_SOURCE_KEY,
        sourceId: articleId,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(
      `Failed to queue knowledge base article refresh for ${articleId}:`,
      error,
    );
  }
};
