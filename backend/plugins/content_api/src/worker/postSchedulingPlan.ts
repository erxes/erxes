import type { JobsOptions } from 'bullmq';

import type { IPost } from '@/cms/@types/posts';

export type TPostScheduleAction = 'publish' | 'archive';

export type TSchedulablePost = Pick<
  IPost,
  'status' | 'scheduledDate' | 'autoArchiveDate'
> & {
  _id: string;
};

export type TPostScheduleJobData = {
  subdomain: string;
  postId: string;
  dueAt: string;
};

type TQueueJob = {
  getState: () => Promise<string>;
  remove: () => Promise<void>;
};

export type TScheduleQueue = {
  add: (
    name: string,
    data: TPostScheduleJobData,
    options: JobsOptions,
  ) => Promise<unknown>;
  getJob: (jobId: string) => Promise<TQueueJob | undefined>;
};

export type TPlannedPostJob = {
  action: TPostScheduleAction;
  data: TPostScheduleJobData;
  options: JobsOptions & { jobId: string };
};

const getSubdomainKey = (subdomain: string) =>
  Buffer.from(subdomain).toString('base64url');

const getPostJobId = ({
  action,
  subdomain,
  postId,
  dueAt,
}: {
  action: TPostScheduleAction;
  subdomain: string;
  postId: string;
  dueAt: Date;
}) =>
  `content-${action}-${getSubdomainKey(
    subdomain,
  )}-${postId}-${dueAt.getTime()}`;

const toValidDate = (value?: Date) => {
  if (!value) {
    return;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

/**
 * Builds the single delayed publish or archive job represented by a post.
 */
export const getPlannedPostJob = ({
  subdomain,
  post,
  now = new Date(),
}: {
  subdomain: string;
  post?: TSchedulablePost | null;
  now?: Date;
}): TPlannedPostJob | undefined => {
  if (!post) {
    return;
  }

  let action: TPostScheduleAction | undefined;
  let dueDate: Date | undefined;

  if (post.status === 'scheduled') {
    action = 'publish';
    dueDate = post.scheduledDate;
  } else if (post.status === 'published') {
    action = 'archive';
    dueDate = post.autoArchiveDate;
  }

  const dueAt = toValidDate(dueDate);

  if (!action || !dueAt) {
    return;
  }

  const jobId = getPostJobId({
    action,
    subdomain,
    postId: post._id,
    dueAt,
  });

  return {
    action,
    data: {
      subdomain,
      postId: post._id,
      dueAt: dueAt.toISOString(),
    },
    options: {
      jobId,
      delay: Math.max(dueAt.getTime() - now.getTime(), 0),
      removeOnComplete: true,
      removeOnFail: true,
    },
  };
};

/**
 * Detects changes that require a delayed job to be added, replaced, or removed.
 */
export const hasPostScheduleChanged = (
  previousPost?: TSchedulablePost | null,
  currentPost?: TSchedulablePost | null,
) => {
  const getTime = (value?: Date) => toValidDate(value)?.getTime();

  return (
    previousPost?.status !== currentPost?.status ||
    getTime(previousPost?.scheduledDate) !==
      getTime(currentPost?.scheduledDate) ||
    getTime(previousPost?.autoArchiveDate) !==
      getTime(currentPost?.autoArchiveDate)
  );
};

const removeJob = async (queue: TScheduleQueue, jobId: string) => {
  const job = await queue.getJob(jobId);

  if (!job || (await job.getState()) === 'active') {
    return;
  }

  try {
    await job.remove();
  } catch (error) {
    if ((await job.getState()) !== 'active') {
      throw error;
    }
  }
};

/**
 * Reconciles one post's previous and current scheduling state with BullMQ.
 */
export const syncPostScheduleWithQueue = async ({
  subdomain,
  previousPost,
  currentPost,
  queue,
  now = new Date(),
}: {
  subdomain: string;
  previousPost?: TSchedulablePost | null;
  currentPost?: TSchedulablePost | null;
  queue: TScheduleQueue;
  now?: Date;
}) => {
  if (!hasPostScheduleChanged(previousPost, currentPost)) {
    return;
  }

  const previousJob = getPlannedPostJob({
    subdomain,
    post: previousPost,
    now,
  });
  const currentJob = getPlannedPostJob({
    subdomain,
    post: currentPost,
    now,
  });

  if (previousJob && previousJob.options.jobId !== currentJob?.options.jobId) {
    await removeJob(queue, previousJob.options.jobId);
  }

  if (currentJob && currentJob.options.jobId !== previousJob?.options.jobId) {
    await queue.add(currentJob.action, currentJob.data, currentJob.options);
  }
};
