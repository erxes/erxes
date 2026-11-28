import { GITHUB_ISSUE_STATES, GITHUB_LOCK_REASONS } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { appAction, parse } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';
import {
  Body,
  choice,
  type GithubKeys,
  ISSUE_NUMBER,
  loginOf,
  Names,
  namesField,
  REPO_FIELDS,
  Repo,
  repoPath,
  User,
  Whole,
  words,
} from './githubInputs';

const Issue = z.object({
  number: z.int(),
  html_url: z.url(),
  state: z.string(),
  title: z.string(),
  body: z.string().nullish(),
  user: User.nullish(),
  labels: z.array(z.union([z.string(), z.object({ name: z.string() })])),
  assignees: z.array(User).nullish(),
  comments: z.int(),
  created_at: z.string(),
  closed_at: z.string().nullish(),
});

const ISSUE_NUMBER_OUTPUT = {
  key: 'number',
  label: 'Issue number',
  type: 'number',
  recordType: 'issue',
} as const;

const ISSUE_OUTPUTS = [
  ISSUE_NUMBER_OUTPUT,
  { key: 'url', label: 'Issue link', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
] as const;

const issueOutput = (issue: z.output<typeof Issue>) => ({
  number: issue.number,
  url: issue.html_url,
  state: issue.state,
});

const THREAD_NUMBER = { ...ISSUE_NUMBER, label: 'Issue or pull request' };

const LABELS_FIELD = namesField('labels', 'Labels', 'bug, customer');

const ASSIGNEES_FIELD = namesField('assignees', 'Assignees', 'octocat');

const CreateInput = Repo.extend({
  title: words(256),
  body: Body.optional(),
  labels: Names.optional(),
  assignees: Names.optional(),
});

export const createIssue = appAction<GithubKeys, z.output<typeof CreateInput>>({
  key: 'create_issue',
  label: 'Create an issue',
  description: 'Open an issue in a repository',
  fields: [
    ...REPO_FIELDS,
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'body', label: 'Text', type: 'longtext', required: false },
    { ...LABELS_FIELD, description: 'Comma separated; labels the repository has' },
    ASSIGNEES_FIELD,
  ],
  outputs: [...ISSUE_OUTPUTS],
  input: CreateInput,
  async run({ client: keys, input }) {
    const issue = parse(
      'GitHub',
      Issue,
      await githubSend(keys, 'POST', repoPath(input, '/issues'), {
        title: input.title,
        body: input.body,
        labels: input.labels,
        assignees: input.assignees,
      }),
      'no issue',
    );

    return issueOutput(issue);
  },
});

const STATES = {
  open: { state: 'open' },
  completed: { state: 'closed', state_reason: 'completed' },
  not_planned: { state: 'closed', state_reason: 'not_planned' },
} as const;

const EditInput = Repo.extend({
  number: Whole,
  title: words(256).optional(),
  body: Body.optional(),
  state: z.enum(GITHUB_ISSUE_STATES).optional(),
  labels: Names.optional(),
  assignees: Names.optional(),
});

export const editIssue = appAction<GithubKeys, z.output<typeof EditInput>>({
  key: 'edit_issue',
  label: 'Edit an issue',
  description: 'Change the title, text, state, labels or assignees of an issue; blank keeps them',
  fields: [
    ...REPO_FIELDS,
    ISSUE_NUMBER,
    { key: 'title', label: 'Title', type: 'text', required: false },
    { key: 'body', label: 'Text', type: 'longtext', required: false },
    choice('state', 'State', GITHUB_ISSUE_STATES, {
      open: 'Open',
      completed: 'Closed as completed',
      not_planned: 'Closed as not planned',
    }),
    { ...LABELS_FIELD, description: 'Comma separated; replaces the current labels' },
    { ...ASSIGNEES_FIELD, description: 'Comma separated; replaces the current assignees' },
  ],
  outputs: [...ISSUE_OUTPUTS],
  input: EditInput,
  async run({ client: keys, input }) {
    const issue = parse(
      'GitHub',
      Issue,
      await githubSend(keys, 'PATCH', repoPath(input, `/issues/${input.number}`), {
        title: input.title,
        body: input.body,
        labels: input.labels,
        assignees: input.assignees,
        ...(input.state ? STATES[input.state] : {}),
      }),
      'no issue',
    );

    return issueOutput(issue);
  },
});

const NumberInput = Repo.extend({ number: Whole });

export const getIssue = appAction<GithubKeys, z.output<typeof NumberInput>>({
  key: 'get_issue',
  label: 'Get an issue',
  description: 'Read an issue’s title, text, state, labels and people',
  fields: [...REPO_FIELDS, ISSUE_NUMBER],
  outputs: [
    ...ISSUE_OUTPUTS,
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'author', label: 'Author', type: 'text' },
    { key: 'labels', label: 'Labels', type: 'text' },
    { key: 'assignees', label: 'Assignees', type: 'text' },
    { key: 'comments', label: 'Comments', type: 'number' },
    { key: 'createdAt', label: 'Opened at', type: 'date' },
    { key: 'closedAt', label: 'Closed at', type: 'date' },
  ],
  input: NumberInput,
  async run({ client: keys, input }) {
    const issue = parse(
      'GitHub',
      Issue,
      await githubSend(keys, 'GET', repoPath(input, `/issues/${input.number}`)),
      'no issue',
    );

    return {
      ...issueOutput(issue),
      title: issue.title,
      text: issue.body ?? '',
      author: loginOf(issue.user),
      labels: issue.labels
        .map((label) => (typeof label === 'string' ? label : label.name))
        .join(', '),
      assignees: (issue.assignees ?? []).map(loginOf).join(', '),
      comments: issue.comments,
      createdAt: issue.created_at,
      closedAt: issue.closed_at ?? null,
    };
  },
});

const LockInput = NumberInput.extend({
  reason: z.enum(GITHUB_LOCK_REASONS).optional(),
});

export const lockIssue = appAction<GithubKeys, z.output<typeof LockInput>>({
  key: 'lock_issue',
  label: 'Lock an issue',
  description: 'Only people with write access can comment on it afterwards',
  fields: [
    ...REPO_FIELDS,
    THREAD_NUMBER,
    choice('reason', 'Reason', GITHUB_LOCK_REASONS, {
      'off-topic': 'Off-topic',
      'too heated': 'Too heated',
      resolved: 'Resolved',
      spam: 'Spam',
    }),
  ],
  outputs: [ISSUE_NUMBER_OUTPUT],
  input: LockInput,
  async run({ client: keys, input }) {
    await githubSend(keys, 'PUT', repoPath(input, `/issues/${input.number}/lock`), {
      lock_reason: input.reason,
    });

    return { number: input.number };
  },
});

const Comment = z.object({ id: z.int(), html_url: z.url() });

const COMMENT_OUTPUTS = [
  { key: 'commentId', label: 'Comment id', type: 'text', recordType: 'comment' },
  { key: 'url', label: 'Comment link', type: 'text' },
] as const;

const CommentInput = NumberInput.extend({ body: words(65_000) });

export const addComment = appAction<GithubKeys, z.output<typeof CommentInput>>({
  key: 'add_comment',
  label: 'Add a comment',
  description: 'Comment on an issue or a pull request',
  fields: [
    ...REPO_FIELDS,
    THREAD_NUMBER,
    { key: 'body', label: 'Comment', type: 'longtext', required: true },
  ],
  outputs: [...COMMENT_OUTPUTS],
  input: CommentInput,
  async run({ client: keys, input }) {
    const comment = parse(
      'GitHub',
      Comment,
      await githubSend(keys, 'POST', repoPath(input, `/issues/${input.number}/comments`), {
        body: input.body,
      }),
      'no comment',
    );

    return { commentId: String(comment.id), url: comment.html_url };
  },
});

const EditCommentInput = Repo.extend({ comment: Whole, body: words(65_000) });

export const editComment = appAction<GithubKeys, z.output<typeof EditCommentInput>>({
  key: 'edit_comment',
  label: 'Edit a comment',
  description: 'Replace the text of a comment on an issue or a pull request',
  fields: [
    ...REPO_FIELDS,
    {
      key: 'comment',
      label: 'Comment',
      type: 'plugin_record',
      recordType: 'comment',
      required: true,
      description: 'The run’s comment, or one an earlier "Add a comment" step gave',
    },
    { key: 'body', label: 'Comment', type: 'longtext', required: true },
  ],
  outputs: [...COMMENT_OUTPUTS],
  input: EditCommentInput,
  async run({ client: keys, input }) {
    const comment = parse(
      'GitHub',
      Comment,
      await githubSend(keys, 'PATCH', repoPath(input, `/issues/comments/${input.comment}`), {
        body: input.body,
      }),
      'no comment',
    );

    return { commentId: String(comment.id), url: comment.html_url };
  },
});
