import { z } from 'zod';
import { Flag, logins, Logins, names, Names, Num, part, Str, User } from './githubFields';

const Thread = z.looseObject({
  id: Num,
  number: Num,
  title: Str,
  state: Str,
  state_reason: Str,
  html_url: Str,
  body: Str,
  user: User,
  labels: Names,
  assignees: Logins,
  milestone: z.looseObject({ title: Str }).nullish(),
  comments: Num,
  created_at: Str,
  updated_at: Str,
  closed_at: Str,
  pull_request: z.looseObject({}).nullish(),
});

const Branch = z
  .looseObject({ ref: Str, sha: Str, repo: z.looseObject({ full_name: Str }).nullish() })
  .nullish();

const PullRequest = Thread.extend({
  draft: Flag,
  merged: Flag,
  merged_by: User,
  merged_at: Str,
  merge_commit_sha: Str,
  head: Branch,
  base: Branch,
  additions: Num,
  deletions: Num,
  changed_files: Num,
  commits: Num,
  review_comments: Num,
  requested_reviewers: Logins,
  requested_teams: Names,
});

type Path = 'issue' | 'pull_request';

const threadCore = (path: Path, noun: string, prefix: string) =>
  part(path, Thread, [
    [
      'number',
      `${noun} number`,
      'number',
      (thread) => thread.number,
      path === 'issue' ? 'issue' : 'pull',
    ],
    ['title', `${noun} title`, 'text', (thread) => thread.title],
    ['state', `${noun} state`, 'text', (thread) => thread.state],
    [`${prefix}Id`, `${noun} ID`, 'number', (thread) => thread.id],
    [`${prefix}Labels`, 'Labels', 'text', (thread) => names(thread.labels)],
    [`${prefix}Assignees`, 'Assignees', 'text', (thread) => logins(thread.assignees)],
    [`${prefix}Milestone`, 'Milestone', 'text', (thread) => thread.milestone?.title],
    [`${prefix}Comments`, 'Comments', 'number', (thread) => thread.comments],
    [`${prefix}CreatedAt`, `${noun} created at`, 'date', (thread) => thread.created_at],
    [`${prefix}UpdatedAt`, `${noun} updated at`, 'date', (thread) => thread.updated_at],
    [`${prefix}ClosedAt`, `${noun} closed at`, 'date', (thread) => thread.closed_at],
  ]);

const threadLink = (path: Path, noun: string) =>
  part(path, Thread, [
    ['url', `${noun} link`, 'text', (thread) => thread.html_url],
    ['text', `${noun} text`, 'text', (thread) => thread.body],
  ]);

const threadAuthor = (path: Path, noun: string) =>
  part(path, Thread, [['author', `${noun} author`, 'text', (thread) => thread.user?.login]]);

const threadAbout = (path: Path, noun: string, prefix: string) =>
  part(path, Thread, [
    [`${prefix}Url`, `${noun} link`, 'text', (thread) => thread.html_url],
    [`${prefix}Body`, `${noun} text`, 'text', (thread) => thread.body],
  ]);

const issueExtra = part('issue', Thread, [
  ['issueStateReason', 'State reason', 'text', (issue) => issue.state_reason],
]);

const pullExtra = part('pull_request', PullRequest, [
  ['merged', 'Merged', 'boolean', (pull) => pull.merged],
  ['base_branch', 'Into branch', 'text', (pull) => pull.base?.ref],
  ['head_branch', 'From branch', 'text', (pull) => pull.head?.ref],
  ['pullRequestDraft', 'Draft', 'boolean', (pull) => pull.draft],
  ['pullRequestMergedBy', 'Merged by', 'text', (pull) => pull.merged_by?.login],
  ['pullRequestMergedAt', 'Merged at', 'date', (pull) => pull.merged_at],
  ['pullRequestMergeCommitSha', 'Merge commit', 'text', (pull) => pull.merge_commit_sha],
  ['pullRequestBaseSha', 'Into commit', 'text', (pull) => pull.base?.sha],
  ['pullRequestHeadSha', 'From commit', 'text', (pull) => pull.head?.sha],
  ['pullRequestHeadRepository', 'From repository', 'text', (pull) => pull.head?.repo?.full_name],
  ['pullRequestAdditions', 'Lines added', 'number', (pull) => pull.additions],
  ['pullRequestDeletions', 'Lines removed', 'number', (pull) => pull.deletions],
  ['pullRequestChangedFiles', 'Files changed', 'number', (pull) => pull.changed_files],
  ['pullRequestCommits', 'Commits', 'number', (pull) => pull.commits],
  ['pullRequestReviewComments', 'Review comments', 'number', (pull) => pull.review_comments],
  [
    'pullRequestRequestedReviewers',
    'Requested reviewers',
    'text',
    (pull) => logins(pull.requested_reviewers),
  ],
  ['pullRequestRequestedTeams', 'Requested teams', 'text', (pull) => names(pull.requested_teams)],
]);

export const ISSUE = [
  threadCore('issue', 'Issue', 'issue'),
  issueExtra,
  threadLink('issue', 'Issue'),
  threadAuthor('issue', 'Issue'),
];

export const PULL = [
  threadCore('pull_request', 'Pull request', 'pullRequest'),
  pullExtra,
  threadLink('pull_request', 'Pull request'),
  threadAuthor('pull_request', 'Pull request'),
];

export const COMMENT = [
  threadCore('issue', 'Issue', 'issue'),
  issueExtra,
  threadAbout('issue', 'Issue', 'issue'),
  part('issue', Thread, [
    ['issueAuthor', 'Issue author', 'text', (issue) => issue.user?.login],
    [
      'issueIsPullRequest',
      'On a pull request',
      'boolean',
      (issue) => issue.pull_request !== undefined && issue.pull_request !== null,
    ],
  ]),
  part(
    'comment',
    z.looseObject({
      id: Num,
      body: Str,
      html_url: Str,
      user: User,
      created_at: Str,
      updated_at: Str,
    }),
    [
      ['text', 'Comment', 'text', (comment) => comment.body],
      ['url', 'Comment link', 'text', (comment) => comment.html_url],
      ['author', 'Comment author', 'text', (comment) => comment.user?.login],
      ['commentId', 'Comment ID', 'number', (comment) => comment.id, 'comment'],
      ['commentCreatedAt', 'Commented at', 'date', (comment) => comment.created_at],
      ['commentUpdatedAt', 'Comment updated at', 'date', (comment) => comment.updated_at],
    ],
  ),
];

export const REVIEW = [
  threadCore('pull_request', 'Pull request', 'pullRequest'),
  pullExtra,
  threadAbout('pull_request', 'Pull request', 'pullRequest'),
  threadAuthor('pull_request', 'Pull request'),
  part(
    'review',
    z.looseObject({
      id: Num,
      state: Str,
      body: Str,
      html_url: Str,
      user: User,
      submitted_at: Str,
      commit_id: Str,
    }),
    [
      ['review_state', 'Review', 'text', (review) => review.state],
      ['text', 'Review text', 'text', (review) => review.body],
      ['url', 'Review link', 'text', (review) => review.html_url],
      ['reviewer', 'Reviewer', 'text', (review) => review.user?.login],
      ['reviewId', 'Review ID', 'number', (review) => review.id, 'review'],
      ['reviewSubmittedAt', 'Reviewed at', 'date', (review) => review.submitted_at],
      ['reviewCommitSha', 'Reviewed commit', 'text', (review) => review.commit_id],
    ],
  ),
];
