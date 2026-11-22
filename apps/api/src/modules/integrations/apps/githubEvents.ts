import { z } from 'zod';
import { BASE, Flag, merge, names, Names, Num, part, Str, User, withAction } from './githubFields';
import { COMMENT, ISSUE, PULL, REVIEW } from './githubThreads';

const Commit = z.looseObject({
  id: Str,
  message: Str,
  url: Str,
  timestamp: Str,
  author: z.looseObject({ name: Str, email: Str, username: Str }).nullish(),
  added: z.array(z.string()).nullish(),
  removed: z.array(z.string()).nullish(),
  modified: z.array(z.string()).nullish(),
});

const Push = z.looseObject({
  ref: z.string(),
  before: Str,
  after: Str,
  created: Flag,
  deleted: Flag,
  forced: Flag,
  compare: Str,
  commits: z.array(Commit).nullish(),
  head_commit: Commit.nullish(),
  pusher: z.looseObject({ name: Str, email: Str }).nullish(),
});

type Files = 'added' | 'removed' | 'modified';

const filesOf = (push: z.output<typeof Push>, kind: Files) =>
  push.commits && [...new Set(push.commits.flatMap((commit) => commit[kind] ?? []))].join(', ');

const push = part(null, Push, [
  ['branch', 'Branch or tag', 'text', (body) => body.ref.replace(/^refs\/(heads|tags)\//, '')],
  ['commit_count', 'Commits', 'number', (body) => body.commits?.length],
  ['message', 'Last commit message', 'text', (body) => body.head_commit?.message],
  ['url', 'Compare link', 'text', (body) => body.compare ?? body.head_commit?.url],
  ['author', 'Pushed by', 'text', (body) => body.pusher?.name],
  ['pushRef', 'Ref', 'text', (body) => body.ref],
  ['pushIsTag', 'Tag pushed', 'boolean', (body) => body.ref.startsWith('refs/tags/')],
  ['pushBefore', 'Commit before', 'text', (body) => body.before],
  ['pushAfter', 'Commit after', 'text', (body) => body.after],
  ['pushCreated', 'Branch or tag created', 'boolean', (body) => body.created],
  ['pushDeleted', 'Branch or tag deleted', 'boolean', (body) => body.deleted],
  ['pushForced', 'Force push', 'boolean', (body) => body.forced],
  ['pusherEmail', 'Pusher email', 'text', (body) => body.pusher?.email],
  ['headCommitId', 'Last commit', 'text', (body) => body.head_commit?.id],
  ['headCommitUrl', 'Last commit link', 'text', (body) => body.head_commit?.url],
  ['headCommitAuthor', 'Last commit author', 'text', (body) => body.head_commit?.author?.name],
  [
    'headCommitAuthorEmail',
    'Last commit author email',
    'text',
    (body) => body.head_commit?.author?.email,
  ],
  [
    'headCommitAuthorUsername',
    'Last commit author username',
    'text',
    (body) => body.head_commit?.author?.username,
  ],
  ['headCommitTimestamp', 'Last commit time', 'date', (body) => body.head_commit?.timestamp],
  [
    'commitMessages',
    'All commit messages',
    'text',
    (body) => body.commits?.map((commit) => commit.message ?? '').join('\n'),
  ],
  ['filesAdded', 'Files added', 'text', (body) => filesOf(body, 'added')],
  ['filesRemoved', 'Files removed', 'text', (body) => filesOf(body, 'removed')],
  ['filesModified', 'Files changed', 'text', (body) => filesOf(body, 'modified')],
]);

const release = part(
  'release',
  z.looseObject({
    id: Num,
    tag_name: z.string(),
    name: Str,
    html_url: Str,
    body: Str,
    draft: Flag,
    prerelease: Flag,
    author: User,
    target_commitish: Str,
    created_at: Str,
    published_at: Str,
    tarball_url: Str,
    zipball_url: Str,
    assets: Names,
  }),
  [
    ['tag', 'Tag', 'text', (rel) => rel.tag_name, 'release'],
    ['title', 'Release title', 'text', (rel) => rel.name || rel.tag_name],
    ['url', 'Release link', 'text', (rel) => rel.html_url],
    ['text', 'Release notes', 'text', (rel) => rel.body],
    ['prerelease', 'Pre-release', 'boolean', (rel) => rel.prerelease],
    ['author', 'Release author', 'text', (rel) => rel.author?.login],
    ['releaseId', 'Release ID', 'number', (rel) => rel.id],
    ['releaseDraft', 'Draft', 'boolean', (rel) => rel.draft],
    ['releaseTarget', 'Target branch or commit', 'text', (rel) => rel.target_commitish],
    ['releaseCreatedAt', 'Release created at', 'date', (rel) => rel.created_at],
    ['releasePublishedAt', 'Published at', 'date', (rel) => rel.published_at],
    ['releaseTarballUrl', 'Source code (tar.gz)', 'text', (rel) => rel.tarball_url],
    ['releaseZipballUrl', 'Source code (zip)', 'text', (rel) => rel.zipball_url],
    ['releaseAssets', 'Release files', 'text', (rel) => names(rel.assets)],
    ['releaseAssetCount', 'Release file count', 'number', (rel) => rel.assets?.length],
  ],
);

const star = part(null, z.looseObject({ starred_at: Str }), [
  ['starredAt', 'Starred at', 'date', (body) => body.starred_at],
]);

const fork = part(
  'forkee',
  z.looseObject({ full_name: Str, html_url: Str, owner: User, created_at: Str }),
  [
    ['fork', 'Fork', 'text', (forkee) => forkee.full_name],
    ['url', 'Fork link', 'text', (forkee) => forkee.html_url],
    ['forkOwner', 'Fork owner', 'text', (forkee) => forkee.owner?.login],
    ['forkCreatedAt', 'Forked at', 'date', (forkee) => forkee.created_at],
  ],
);

const workflowRun = part(
  'workflow_run',
  z.looseObject({
    id: Num,
    name: Str,
    display_title: Str,
    path: Str,
    status: Str,
    conclusion: Str,
    event: Str,
    head_branch: Str,
    head_sha: Str,
    html_url: Str,
    run_number: Num,
    run_attempt: Num,
    actor: User,
    triggering_actor: User,
    run_started_at: Str,
    updated_at: Str,
    head_commit: z.looseObject({ message: Str }).nullish(),
    pull_requests: z.array(z.looseObject({ number: z.number() })).nullish(),
  }),
  [
    ['workflow', 'Workflow', 'text', (run) => run.name],
    ['status', 'Status', 'text', (run) => run.status],
    ['conclusion', 'Conclusion', 'text', (run) => run.conclusion],
    ['branch', 'Branch', 'text', (run) => run.head_branch],
    ['url', 'Run link', 'text', (run) => run.html_url],
    ['author', 'Started by', 'text', (run) => run.actor?.login],
    ['workflowRunId', 'Run ID', 'number', (run) => run.id],
    ['workflowRunNumber', 'Run number', 'number', (run) => run.run_number],
    ['workflowRunAttempt', 'Attempt', 'number', (run) => run.run_attempt],
    ['workflowRunTitle', 'Run title', 'text', (run) => run.display_title],
    ['workflowRunPath', 'Workflow file', 'text', (run) => run.path],
    ['workflowRunEvent', 'Started on event', 'text', (run) => run.event],
    ['workflowRunSha', 'Commit', 'text', (run) => run.head_sha],
    ['workflowRunCommitMessage', 'Commit message', 'text', (run) => run.head_commit?.message],
    ['workflowRunTriggeredBy', 'Triggered by', 'text', (run) => run.triggering_actor?.login],
    ['workflowRunStartedAt', 'Started at', 'date', (run) => run.run_started_at],
    ['workflowRunUpdatedAt', 'Updated at', 'date', (run) => run.updated_at],
    [
      'workflowRunPullRequests',
      'Pull requests',
      'text',
      (run) => run.pull_requests?.map((pull) => pull.number).join(', '),
    ],
  ],
);

const EVENTS = {
  push: merge(BASE, push),
  pull_request: withAction(...PULL),
  pull_request_review: withAction(...REVIEW),
  issues: withAction(...ISSUE),
  issue_comment: withAction(...COMMENT),
  release: withAction(release),
  star: withAction(star),
  fork: merge(BASE, fork),
  workflow_run: withAction(workflowRun),
};

export type GithubEvent = keyof typeof EVENTS;

const isGithubEvent = (type: string): type is GithubEvent => Object.hasOwn(EVENTS, type);

const OTHER = withAction();

export const githubOutputs = (type: GithubEvent) => EVENTS[type].outputs;

export const githubPayload = (type: string, raw: unknown) => {
  const body = z.record(z.string(), z.unknown()).safeParse(raw);

  if (!body.success) return null;

  return (isGithubEvent(type) ? EVENTS[type] : OTHER).read(body.data);
};
