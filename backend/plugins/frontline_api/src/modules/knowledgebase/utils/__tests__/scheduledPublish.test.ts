const add = jest.fn();

jest.mock('erxes-api-shared/utils', () => ({
  sendWorkerQueue: jest.fn(() => ({ add })),
  createMQWorkerWithListeners: jest.fn(),
  redis: {},
}));

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(),
}));

jest.mock('@/knowledgebase/utils/refreshKnowledgeArticle', () => ({
  refreshKnowledgeArticle: jest.fn(),
}));

import {
  KB_SCHEDULED_PUBLISH_QUEUE,
  publishScheduledArticle,
  scheduleArticlePublish,
} from '@/knowledgebase/utils/scheduledPublish';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

describe('scheduleArticlePublish', () => {
  beforeEach(() => {
    add.mockReset();
    jest.useFakeTimers().setSystemTime(new Date('2026-10-07T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('queues a delayed job for the tenant when the article is scheduled', async () => {
    await scheduleArticlePublish('tenant-a', {
      _id: 'article-1',
      status: 'scheduled',
      scheduledDate: new Date('2026-10-07T12:00:00Z'),
    });

    expect(sendWorkerQueue).toHaveBeenCalledWith(
      'frontline',
      KB_SCHEDULED_PUBLISH_QUEUE,
    );
    expect(add).toHaveBeenCalledWith(
      'publishScheduledArticle',
      { subdomain: 'tenant-a', articleId: 'article-1' },
      expect.objectContaining({ delay: 2 * 3600e3 }),
    );
  });

  it('runs a date that has already passed straight away', async () => {
    await scheduleArticlePublish('tenant-a', {
      _id: 'article-1',
      status: 'scheduled',
      scheduledDate: new Date('2026-10-07T09:00:00Z'),
    });

    expect(add).toHaveBeenCalledWith(
      'publishScheduledArticle',
      expect.anything(),
      expect.objectContaining({ delay: 0 }),
    );
  });

  it('queues nothing for an article that is not scheduled', async () => {
    await scheduleArticlePublish('tenant-a', {
      _id: 'article-1',
      status: 'draft',
      scheduledDate: new Date('2026-10-07T12:00:00Z'),
    });
    await scheduleArticlePublish('tenant-a', {
      _id: 'article-2',
      status: 'scheduled',
    });
    await scheduleArticlePublish('tenant-a', null);

    expect(add).not.toHaveBeenCalled();
  });

  it('does not fail the save when the queue is unavailable', async () => {
    const error = jest.spyOn(console, 'error').mockReturnValue(undefined);
    add.mockRejectedValueOnce(new Error('redis down'));

    await expect(
      scheduleArticlePublish('tenant-a', {
        _id: 'article-1',
        status: 'scheduled',
        scheduledDate: new Date('2026-10-07T12:00:00Z'),
      }),
    ).resolves.toBeUndefined();

    error.mockRestore();
  });
});

describe('publishScheduledArticle', () => {
  it('publishes only a still-scheduled article whose date has come', async () => {
    const findOneAndUpdate = jest.fn().mockResolvedValue({ _id: 'article-1' });
    const models = { Article: { findOneAndUpdate } } as unknown as IModels;
    const now = new Date('2026-10-07T12:00:00Z');

    jest.useFakeTimers().setSystemTime(now);

    await publishScheduledArticle(models, 'article-1');

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: 'article-1',
        status: 'scheduled',
        scheduledDate: { $lte: now },
      },
      { $set: { status: 'publish', publishedAt: now } },
      { new: true },
    );

    jest.useRealTimers();
  });
});
