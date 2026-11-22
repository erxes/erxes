import { z } from 'zod';

const Login = z.object({ login: z.string() }).nullish();

const Thread = z.object({
  number: z.number(),
  title: z.string(),
  html_url: z.string(),
  state: z.string(),
  body: z.string().nullish(),
  user: Login,
});

const threadFields = (thread: z.output<typeof Thread>) => ({
  number: thread.number,
  title: thread.title,
  url: thread.html_url,
  state: thread.state,
  text: thread.body ?? '',
  author: thread.user?.login ?? null,
});

const Branch = z.object({ ref: z.string() });

const FLAT: Record<string, z.ZodType<Record<string, unknown>>> = {
  push: z
    .object({
      ref: z.string(),
      compare: z.string().nullish(),
      commits: z.array(z.unknown()).default([]),
      pusher: z.object({ name: z.string() }).nullish(),
      head_commit: z.object({ message: z.string(), url: z.string() }).nullish(),
    })
    .transform((push) => ({
      branch: push.ref.replace(/^refs\/(heads|tags)\//, ''),
      commit_count: push.commits.length,
      message: push.head_commit?.message ?? '',
      url: push.compare ?? push.head_commit?.url ?? null,
      author: push.pusher?.name ?? null,
    })),
  pull_request: z
    .object({
      pull_request: Thread.extend({
        merged: z.boolean().nullish(),
        base: Branch,
        head: Branch,
      }),
    })
    .transform(({ pull_request: pull }) => ({
      ...threadFields(pull),
      merged: pull.merged ?? false,
      base_branch: pull.base.ref,
      head_branch: pull.head.ref,
    })),
  pull_request_review: z
    .object({
      review: z.object({
        state: z.string(),
        body: z.string().nullish(),
        html_url: z.string(),
        user: Login,
      }),
      pull_request: Thread,
    })
    .transform(({ review, pull_request: pull }) => ({
      ...threadFields(pull),
      review_state: review.state,
      text: review.body ?? '',
      url: review.html_url,
      reviewer: review.user?.login ?? null,
    })),
  issues: z.object({ issue: Thread }).transform(({ issue }) => threadFields(issue)),
  issue_comment: z
    .object({
      issue: Thread,
      comment: z.object({ body: z.string(), html_url: z.string(), user: Login }),
    })
    .transform(({ issue, comment }) => ({
      ...threadFields(issue),
      text: comment.body,
      url: comment.html_url,
      author: comment.user?.login ?? null,
    })),
  release: z
    .object({
      release: z.object({
        tag_name: z.string(),
        name: z.string().nullish(),
        html_url: z.string(),
        body: z.string().nullish(),
        prerelease: z.boolean().default(false),
        author: Login,
      }),
    })
    .transform(({ release }) => ({
      tag: release.tag_name,
      title: release.name ?? release.tag_name,
      url: release.html_url,
      text: release.body ?? '',
      prerelease: release.prerelease,
      author: release.author?.login ?? null,
    })),
  fork: z
    .object({ forkee: z.object({ full_name: z.string(), html_url: z.string() }) })
    .transform(({ forkee }) => ({ fork: forkee.full_name, url: forkee.html_url })),
  workflow_run: z
    .object({
      workflow_run: z.object({
        name: z.string().nullish(),
        status: z.string().nullish(),
        conclusion: z.string().nullish(),
        head_branch: z.string().nullish(),
        html_url: z.string(),
        actor: Login,
      }),
    })
    .transform(({ workflow_run: run }) => ({
      workflow: run.name ?? '',
      status: run.status ?? '',
      conclusion: run.conclusion ?? '',
      branch: run.head_branch ?? '',
      url: run.html_url,
      author: run.actor?.login ?? null,
    })),
};

const GithubBody = z.looseObject({
  action: z.string().nullish(),
  repository: z.object({ full_name: z.string() }).nullish(),
  sender: Login,
});

export const githubPayload = (type: string, raw: unknown) => {
  const body = GithubBody.safeParse(raw);

  if (!body.success) return null;

  const flat = FLAT[type]?.safeParse(body.data);

  return {
    ...body.data,
    action: body.data.action ?? '',
    repository_name: body.data.repository?.full_name ?? '',
    sender_login: body.data.sender?.login ?? '',
    ...(flat?.success ? flat.data : {}),
  };
};
