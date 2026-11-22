import { z } from 'zod';
import { defineIntegration, hookTrigger, secret } from '../define';
import { githubHooks, githubSend } from './githubHooks';

const COMMON = [
  { key: 'repository_name', label: 'Repository', type: 'text' },
  { key: 'sender_login', label: 'GitHub user', type: 'text' },
] as const;

const THREAD = [
  ...COMMON,
  { key: 'number', label: 'Number', type: 'number' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'url', label: 'Link', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'text', label: 'Text', type: 'text' },
  { key: 'author', label: 'Author', type: 'text' },
] as const;

const PULL = [
  ...THREAD,
  { key: 'merged', label: 'Merged', type: 'boolean' },
  { key: 'base_branch', label: 'Into branch', type: 'text' },
  { key: 'head_branch', label: 'From branch', type: 'text' },
] as const;

const RUN = [
  ...COMMON,
  { key: 'workflow', label: 'Workflow', type: 'text' },
  { key: 'conclusion', label: 'Conclusion', type: 'text' },
  { key: 'branch', label: 'Branch', type: 'text' },
  { key: 'url', label: 'Link', type: 'text' },
  { key: 'author', label: 'Started by', type: 'text' },
] as const;

const actionIs =
  (...actions: string[]) =>
  (payload: Record<string, unknown>) =>
    typeof payload.action === 'string' && actions.includes(payload.action);

const trigger = (
  key: string,
  on: string,
  label: string,
  description: string,
  outputs: readonly { key: string; label: string; type: 'text' | 'number' | 'boolean' }[],
  when?: (payload: Record<string, unknown>) => boolean,
) => hookTrigger({ key, on, label, description, outputs: [...outputs], when });

const GITHUB_TRIGGERS = [
  trigger('push', 'push', 'Code pushed', 'Commits are pushed to a branch or tag', [
    ...COMMON,
    { key: 'branch', label: 'Branch or tag', type: 'text' },
    { key: 'commit_count', label: 'Commits', type: 'number' },
    { key: 'message', label: 'Last commit message', type: 'text' },
    { key: 'url', label: 'Compare link', type: 'text' },
    { key: 'author', label: 'Pushed by', type: 'text' },
  ]),
  trigger(
    'pull_request_opened',
    'pull_request',
    'Pull request opened',
    'Someone opens a pull request',
    PULL,
    actionIs('opened'),
  ),
  trigger(
    'pull_request_merged',
    'pull_request',
    'Pull request merged',
    'A pull request is merged',
    PULL,
    (payload) => actionIs('closed')(payload) && payload.merged === true,
  ),
  trigger(
    'pull_request_closed',
    'pull_request',
    'Pull request closed without merging',
    'A pull request is closed and not merged',
    PULL,
    (payload) => actionIs('closed')(payload) && payload.merged !== true,
  ),
  trigger(
    'pull_request_review_submitted',
    'pull_request_review',
    'Pull request reviewed',
    'A reviewer approves, comments on or asks for changes to a pull request',
    [
      ...THREAD,
      { key: 'review_state', label: 'Review', type: 'text' },
      { key: 'reviewer', label: 'Reviewer', type: 'text' },
    ],
    actionIs('submitted'),
  ),
  trigger(
    'issue_opened',
    'issues',
    'Issue opened',
    'Someone opens an issue',
    THREAD,
    actionIs('opened'),
  ),
  trigger(
    'issue_closed',
    'issues',
    'Issue closed',
    'An issue is closed',
    THREAD,
    actionIs('closed'),
  ),
  trigger(
    'issue_comment_created',
    'issue_comment',
    'Comment added',
    'Someone comments on an issue or pull request',
    THREAD,
    actionIs('created'),
  ),
  trigger(
    'release_published',
    'release',
    'Release published',
    'A release is published',
    [
      ...COMMON,
      { key: 'tag', label: 'Tag', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'url', label: 'Link', type: 'text' },
      { key: 'text', label: 'Notes', type: 'text' },
      { key: 'prerelease', label: 'Pre-release', type: 'boolean' },
      { key: 'author', label: 'Author', type: 'text' },
    ],
    actionIs('published'),
  ),
  trigger(
    'star_created',
    'star',
    'Repository starred',
    'Someone stars the repository',
    COMMON,
    actionIs('created'),
  ),
  trigger('repository_forked', 'fork', 'Repository forked', 'Someone forks the repository', [
    ...COMMON,
    { key: 'fork', label: 'Fork', type: 'text' },
    { key: 'url', label: 'Link', type: 'text' },
  ]),
  trigger(
    'workflow_run_completed',
    'workflow_run',
    'Workflow finished',
    'A GitHub Actions workflow run finishes, whatever its result',
    RUN,
    actionIs('completed'),
  ),
  trigger(
    'workflow_run_failed',
    'workflow_run',
    'Workflow failed',
    'A GitHub Actions workflow run finishes with a failure',
    RUN,
    (payload) => actionIs('completed')(payload) && payload.conclusion === 'failure',
  ),
];

export const github = defineIntegration({
  key: 'github',
  name: 'GitHub',
  summary: 'Start automations when code, pull requests, issues or releases change in a repository.',
  category: 'developer',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://github.com/settings/tokens',
  keys: z.object({ accessToken: secret('Personal access token') }),
  async verify(config, options) {
    await githubSend(config, 'GET', '/user', undefined, options);
  },
  hooks: githubHooks,
  triggers: GITHUB_TRIGGERS,
});
