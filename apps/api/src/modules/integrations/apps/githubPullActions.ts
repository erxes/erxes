import { GITHUB_MERGE_METHODS, GITHUB_PULL_STATES } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { appAction, parse } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';
import {
  Body,
  choice,
  type GithubKeys,
  loginOf,
  PULL_NUMBER,
  REPO_FIELDS,
  Repo,
  repoPath,
  User,
  Whole,
  words,
} from './githubInputs';

const Branch = z.object({ ref: z.string() });

const Pull = z.object({
  number: z.int(),
  html_url: z.url(),
  state: z.string(),
  title: z.string(),
  body: z.string().nullish(),
  user: User.nullish(),
  draft: z.boolean().nullish(),
  merged: z.boolean().nullish(),
  base: Branch,
  head: Branch,
  additions: z.int().nullish(),
  deletions: z.int().nullish(),
  changed_files: z.int().nullish(),
  created_at: z.string(),
});

const PULL_OUTPUTS = [
  { key: 'number', label: 'Pull request number', type: 'number', recordType: 'pull' },
  { key: 'url', label: 'Pull request link', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
] as const;

const pullOutput = (pull: z.output<typeof Pull>) => ({
  number: pull.number,
  url: pull.html_url,
  state: pull.state,
});

const BASE_FIELD = {
  key: 'base',
  label: 'Into branch',
  type: 'text',
  required: true,
  placeholder: 'main',
} as const;

const CreateInput = Repo.extend({
  head: words(255),
  base: words(255),
  title: words(256),
  body: Body.optional(),
  draft: z.boolean().optional(),
});

export const createPullRequest = appAction<GithubKeys, z.output<typeof CreateInput>>({
  key: 'create_pull_request',
  label: 'Create a pull request',
  description: 'Ask to merge one branch into another',
  fields: [
    ...REPO_FIELDS,
    {
      key: 'head',
      label: 'From branch',
      type: 'text',
      required: true,
      placeholder: 'fix-login',
      description: 'From a fork: owner:branch',
    },
    BASE_FIELD,
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'body', label: 'Text', type: 'longtext', required: false },
    { key: 'draft', label: 'Draft', type: 'boolean', required: false },
  ],
  outputs: [...PULL_OUTPUTS],
  input: CreateInput,
  async run({ client: keys, input }) {
    const pull = parse(
      'GitHub',
      Pull,
      await githubSend(keys, 'POST', repoPath(input, '/pulls'), {
        head: input.head,
        base: input.base,
        title: input.title,
        body: input.body,
        draft: input.draft,
      }),
      'no pull request',
    );

    return pullOutput(pull);
  },
});

const EditInput = Repo.extend({
  number: Whole,
  title: words(256).optional(),
  body: Body.optional(),
  state: z.enum(GITHUB_PULL_STATES).optional(),
  base: words(255).optional(),
});

type EditInput = z.output<typeof EditInput>;

const editPull = async (keys: GithubKeys, input: EditInput) =>
  pullOutput(
    parse(
      'GitHub',
      Pull,
      await githubSend(keys, 'PATCH', repoPath(input, `/pulls/${input.number}`), {
        title: input.title,
        body: input.body,
        state: input.state,
        base: input.base,
      }),
      'no pull request',
    ),
  );

export const editPullRequest = appAction<GithubKeys, EditInput>({
  key: 'edit_pull_request',
  label: 'Edit a pull request',
  description: 'Change the title, text, state or target branch; blank keeps them',
  fields: [
    ...REPO_FIELDS,
    PULL_NUMBER,
    { key: 'title', label: 'Title', type: 'text', required: false },
    { key: 'body', label: 'Text', type: 'longtext', required: false },
    choice('state', 'State', GITHUB_PULL_STATES, { open: 'Open', closed: 'Closed' }),
    { ...BASE_FIELD, required: false },
  ],
  outputs: [...PULL_OUTPUTS],
  input: EditInput,
  run: ({ client: keys, input }) => editPull(keys, input),
});

const NumberInput = Repo.extend({ number: Whole });

export const closePullRequest = appAction<GithubKeys, z.output<typeof NumberInput>>({
  key: 'close_pull_request',
  label: 'Close a pull request',
  description: 'Close it without merging',
  fields: [...REPO_FIELDS, PULL_NUMBER],
  outputs: [...PULL_OUTPUTS],
  input: NumberInput,
  run: ({ client: keys, input }) => editPull(keys, { ...input, state: 'closed' }),
});

export const reopenPullRequest = appAction<GithubKeys, z.output<typeof NumberInput>>({
  key: 'reopen_pull_request',
  label: 'Reopen a pull request',
  description: 'Open a closed pull request again',
  fields: [...REPO_FIELDS, PULL_NUMBER],
  outputs: [...PULL_OUTPUTS],
  input: NumberInput,
  run: ({ client: keys, input }) => editPull(keys, { ...input, state: 'open' }),
});

export const getPullRequest = appAction<GithubKeys, z.output<typeof NumberInput>>({
  key: 'get_pull_request',
  label: 'Get a pull request',
  description: 'Read a pull request’s title, text, branches and size',
  fields: [...REPO_FIELDS, PULL_NUMBER],
  outputs: [
    ...PULL_OUTPUTS,
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'author', label: 'Author', type: 'text' },
    { key: 'draft', label: 'Draft', type: 'boolean' },
    { key: 'merged', label: 'Merged', type: 'boolean' },
    { key: 'baseBranch', label: 'Into branch', type: 'text' },
    { key: 'headBranch', label: 'From branch', type: 'text' },
    { key: 'additions', label: 'Lines added', type: 'number' },
    { key: 'deletions', label: 'Lines removed', type: 'number' },
    { key: 'changedFiles', label: 'Files changed', type: 'number' },
    { key: 'createdAt', label: 'Opened at', type: 'date' },
  ],
  input: NumberInput,
  async run({ client: keys, input }) {
    const pull = parse(
      'GitHub',
      Pull,
      await githubSend(keys, 'GET', repoPath(input, `/pulls/${input.number}`)),
      'no pull request',
    );

    return {
      ...pullOutput(pull),
      title: pull.title,
      text: pull.body ?? '',
      author: loginOf(pull.user),
      draft: pull.draft ?? false,
      merged: pull.merged ?? false,
      baseBranch: pull.base.ref,
      headBranch: pull.head.ref,
      additions: pull.additions ?? 0,
      deletions: pull.deletions ?? 0,
      changedFiles: pull.changed_files ?? 0,
      createdAt: pull.created_at,
    };
  },
});

const MergeInput = NumberInput.extend({
  method: z.enum(GITHUB_MERGE_METHODS).default('merge'),
  commitTitle: words(256).optional(),
  commitMessage: Body.optional(),
});

const Merged = z.object({
  sha: z.string().nullish(),
  merged: z.boolean().nullish(),
  message: z.string().nullish(),
});

export const mergePullRequest = appAction<GithubKeys, z.output<typeof MergeInput>>({
  key: 'merge_pull_request',
  label: 'Merge a pull request',
  description: 'Merge it now, or add it to the merge queue when its branch needs one',
  fields: [
    ...REPO_FIELDS,
    PULL_NUMBER,
    {
      ...choice('method', 'How to merge', GITHUB_MERGE_METHODS, {
        merge: 'Merge commit',
        squash: 'Squash and merge',
        rebase: 'Rebase and merge',
      }),
      description: 'Blank: merge commit',
    },
    { key: 'commitTitle', label: 'Commit title', type: 'text', required: false },
    { key: 'commitMessage', label: 'Commit message', type: 'longtext', required: false },
  ],
  outputs: [
    { key: 'merged', label: 'Merged', type: 'boolean' },
    { key: 'sha', label: 'Merge commit', type: 'text' },
    { key: 'message', label: 'GitHub’s answer', type: 'text' },
  ],
  input: MergeInput,
  async run({ client: keys, input }) {
    const merged = parse(
      'GitHub',
      Merged,
      await githubSend(keys, 'PUT', repoPath(input, `/pulls/${input.number}/merge`), {
        merge_method: input.method,
        commit_title: input.commitTitle,
        commit_message: input.commitMessage,
      }),
      'no merge result',
    );

    return {
      merged: merged.merged ?? false,
      sha: merged.sha ?? '',
      message: merged.message ?? '',
    };
  },
});
