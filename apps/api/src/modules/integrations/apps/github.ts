import { z } from 'zod';
import { defineIntegration, secret, hookTrigger } from '@erxes/plugin-sdk/integrations';
import { GITHUB_ACTIONS } from './githubActions';
import { type GithubEvent, githubOutputs } from './githubEvents';
import { githubHooks, githubSend } from './githubHooks';
import { GITHUB_RECORDS } from './githubRecords';

const actionIs =
  (...actions: string[]) =>
  (payload: Record<string, unknown>) =>
    typeof payload.action === 'string' && actions.includes(payload.action);

const trigger = (
  key: string,
  on: GithubEvent,
  label: string,
  description: string,
  when?: (payload: Record<string, unknown>) => boolean,
) => hookTrigger({ key, on, label, description, outputs: githubOutputs(on), when });

const GITHUB_TRIGGERS = [
  trigger('push', 'push', 'Code pushed', 'Commits are pushed to a branch or tag'),
  trigger(
    'pull_request_opened',
    'pull_request',
    'Pull request opened',
    'Someone opens a pull request',
    actionIs('opened'),
  ),
  trigger(
    'pull_request_merged',
    'pull_request',
    'Pull request merged',
    'A pull request is merged',
    (payload) => actionIs('closed')(payload) && payload.merged === true,
  ),
  trigger(
    'pull_request_closed',
    'pull_request',
    'Pull request closed without merging',
    'A pull request is closed and not merged',
    (payload) => actionIs('closed')(payload) && payload.merged !== true,
  ),
  trigger(
    'pull_request_review_submitted',
    'pull_request_review',
    'Pull request reviewed',
    'A reviewer approves, comments on or asks for changes to a pull request',
    actionIs('submitted'),
  ),
  trigger('issue_opened', 'issues', 'Issue opened', 'Someone opens an issue', actionIs('opened')),
  trigger('issue_closed', 'issues', 'Issue closed', 'An issue is closed', actionIs('closed')),
  trigger(
    'issue_comment_created',
    'issue_comment',
    'Comment added',
    'Someone comments on an issue or pull request',
    actionIs('created'),
  ),
  trigger(
    'release_published',
    'release',
    'Release published',
    'A release is published',
    actionIs('published'),
  ),
  trigger(
    'star_created',
    'star',
    'Repository starred',
    'Someone stars the repository',
    actionIs('created'),
  ),
  trigger('repository_forked', 'fork', 'Repository forked', 'Someone forks the repository'),
  trigger(
    'workflow_run_completed',
    'workflow_run',
    'Workflow finished',
    'A GitHub Actions workflow run finishes, whatever its result',
    actionIs('completed'),
  ),
  trigger(
    'workflow_run_failed',
    'workflow_run',
    'Workflow failed',
    'A GitHub Actions workflow run finishes with a failure',
    (payload) => actionIs('completed')(payload) && payload.conclusion === 'failure',
  ),
];

export const github = defineIntegration({
  key: 'github',
  name: 'GitHub',
  summary:
    'Start automations when code, pull requests, issues or releases change, and let them manage issues, pull requests, releases, files and workflows.',
  category: 'developer',
  countries: [],
  permission: 'integrations.manage',
  scopes: ['org', 'personal'],
  dashboard: 'https://github.com/settings/tokens',
  keys: z.object({ accessToken: secret('Personal access token') }),
  client: (keys) => keys,
  async verify(keys) {
    await githubSend(keys, 'GET', '/user');
  },
  hooks: githubHooks,
  triggers: GITHUB_TRIGGERS,
  actions: GITHUB_ACTIONS,
  records: GITHUB_RECORDS,
});
