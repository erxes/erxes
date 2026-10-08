import { Job } from 'bullmq';
import {
  createMQWorkerWithListeners,
  redis,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { IArticleDocument } from '@/knowledgebase/@types/article';
import { PUBLISH_STATUSES } from '@/knowledgebase/db/definitions/constant';
import { refreshKnowledgeArticle } from '@/knowledgebase/utils/refreshKnowledgeArticle';
import { generateModels, IModels } from '~/connectionResolvers';

export const KB_SCHEDULED_PUBLISH_QUEUE = 'knowledgeBaseScheduledPublish';

type TScheduledPublishJob = { subdomain: string; articleId: string };

export const scheduleArticlePublish = async (
  subdomain: string,
  article?: Pick<IArticleDocument, '_id' | 'status' | 'scheduledDate'> | null,
) => {
  if (
    !article ||
    article.status !== PUBLISH_STATUSES.SCHEDULED ||
    !article.scheduledDate
  ) {
    return;
  }

  const delay = Math.max(
    0,
    new Date(article.scheduledDate).getTime() - Date.now(),
  );

  try {
    await sendWorkerQueue('frontline', KB_SCHEDULED_PUBLISH_QUEUE).add(
      'publishScheduledArticle',
      { subdomain, articleId: article._id },
      { delay, removeOnComplete: true, removeOnFail: 50 },
    );
  } catch (error) {
    console.error(
      `Failed to schedule knowledge base article ${article._id}:`,
      error,
    );
  }
};

export const publishScheduledArticle = async (
  models: IModels,
  articleId: string,
) => {
  const now = new Date();

  return models.Article.findOneAndUpdate(
    {
      _id: articleId,
      status: PUBLISH_STATUSES.SCHEDULED,
      scheduledDate: { $lte: now },
    },
    { $set: { status: PUBLISH_STATUSES.PUBLISH, publishedAt: now } },
    { new: true },
  );
};

export const startScheduledPublishWorker = () =>
  createMQWorkerWithListeners(
    'frontline',
    KB_SCHEDULED_PUBLISH_QUEUE,
    async (job: Job<TScheduledPublishJob>) => {
      const { subdomain, articleId } = job.data || {};

      if (!subdomain || !articleId) {
        return;
      }

      const models = await generateModels(subdomain);
      const published = await publishScheduledArticle(models, articleId);

      if (published) {
        await refreshKnowledgeArticle({ subdomain, articleId });
      }
    },
    redis,
    () => undefined,
  );
