import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { JobsOptions } from 'bullmq';

import {
  getPlannedPostJob,
  syncPostScheduleWithQueue,
  TPostScheduleJobData,
  TSchedulablePost,
} from '~/worker/postSchedulingPlan';

class FakeJob {
  public removed = false;

  constructor(private readonly state: string) {}

  public getState = async () => this.state;

  public remove = async () => {
    this.removed = true;
  };
}

class FakeQueue {
  public readonly jobs = new Map<string, FakeJob>();
  public readonly added: Array<{
    name: string;
    data: TPostScheduleJobData;
    options: JobsOptions;
  }> = [];

  public add = async (
    name: string,
    data: TPostScheduleJobData,
    options: JobsOptions,
  ) => {
    this.added.push({ name, data, options });
  };

  public getJob = async (jobId: string) => this.jobs.get(jobId);
}

describe('post scheduling', () => {
  const now = new Date('2026-07-23T00:00:00.000Z');

  it('creates a delayed publish job with automatic cleanup', () => {
    const dueAt = new Date('2026-07-23T00:05:00.000Z');
    const job = getPlannedPostJob({
      subdomain: 'acme',
      post: {
        _id: 'post-1',
        status: 'scheduled',
        scheduledDate: dueAt,
      },
      now,
    });

    assert.equal(job?.action, 'publish');
    assert.equal(job?.options.delay, 300_000);
    assert.equal(job?.options.removeOnComplete, true);
    assert.equal(job?.options.removeOnFail, true);
    assert.match(job?.options.jobId || '', /post-1-1784765100000$/);
  });

  it('does not touch the queue when scheduling fields are unchanged', async () => {
    const queue = new FakeQueue();
    const post: TSchedulablePost = {
      _id: 'post-1',
      status: 'scheduled',
      scheduledDate: new Date('2026-07-23T00:05:00.000Z'),
    };

    await syncPostScheduleWithQueue({
      subdomain: 'acme',
      previousPost: post,
      currentPost: { ...post, autoArchiveDate: undefined },
      queue,
      now,
    });

    assert.equal(queue.added.length, 0);
  });

  it('replaces the previous delayed job when the due date changes', async () => {
    const queue = new FakeQueue();
    const previousPost: TSchedulablePost = {
      _id: 'post-1',
      status: 'scheduled',
      scheduledDate: new Date('2026-07-23T00:05:00.000Z'),
    };
    const currentPost = {
      ...previousPost,
      scheduledDate: new Date('2026-07-23T00:10:00.000Z'),
    };
    const previousJob = getPlannedPostJob({
      subdomain: 'acme',
      post: previousPost,
      now,
    });

    assert.ok(previousJob);

    const queuedJob = new FakeJob('delayed');
    queue.jobs.set(previousJob.options.jobId, queuedJob);

    await syncPostScheduleWithQueue({
      subdomain: 'acme',
      previousPost,
      currentPost,
      queue,
      now,
    });

    assert.equal(queuedJob.removed, true);
    assert.equal(queue.added.length, 1);
    assert.equal(queue.added[0].name, 'publish');
    assert.equal(queue.added[0].options.delay, 600_000);
  });

  it('keeps an active stale job while adding the replacement job', async () => {
    const queue = new FakeQueue();
    const previousPost: TSchedulablePost = {
      _id: 'post-1',
      status: 'scheduled',
      scheduledDate: new Date('2026-07-23T00:05:00.000Z'),
    };
    const previousJob = getPlannedPostJob({
      subdomain: 'acme',
      post: previousPost,
      now,
    });

    assert.ok(previousJob);

    const activeJob = new FakeJob('active');
    queue.jobs.set(previousJob.options.jobId, activeJob);

    await syncPostScheduleWithQueue({
      subdomain: 'acme',
      previousPost,
      currentPost: {
        ...previousPost,
        scheduledDate: new Date('2026-07-23T00:10:00.000Z'),
      },
      queue,
      now,
    });

    assert.equal(activeJob.removed, false);
    assert.equal(queue.added.length, 1);
  });

  it('adds an archive job when a scheduled post becomes published', async () => {
    const queue = new FakeQueue();
    const archiveAt = new Date('2026-07-24T00:00:00.000Z');

    await syncPostScheduleWithQueue({
      subdomain: 'acme',
      previousPost: {
        _id: 'post-1',
        status: 'scheduled',
        scheduledDate: now,
        autoArchiveDate: archiveAt,
      },
      currentPost: {
        _id: 'post-1',
        status: 'published',
        scheduledDate: now,
        autoArchiveDate: archiveAt,
      },
      queue,
      now,
    });

    assert.equal(queue.added.length, 1);
    assert.equal(queue.added[0].name, 'archive');
    assert.equal(queue.added[0].options.delay, 86_400_000);
  });
});
