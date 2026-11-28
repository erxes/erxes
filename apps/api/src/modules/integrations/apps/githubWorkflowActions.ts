import { z } from 'zod';
import { appAction, parse, Text } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';
import {
  explained,
  type GithubKeys,
  inRepository,
  LIMIT_FIELD,
  Limit,
  listed,
  listOutputs,
  REPO_FIELDS,
  Repo,
  repoPath,
  withQuery,
  words,
} from './githubInputs';

const WORKFLOW_FIELD = inRepository('workflow', 'Workflow', 'workflow');

const WorkflowInput = Repo.extend({ workflow: words(255) });

type WorkflowInput = z.output<typeof WorkflowInput>;

const workflowPath = (input: WorkflowInput, path = '') =>
  repoPath(input, `/actions/workflows/${encodeURIComponent(input.workflow)}${path}`);

const missing = (input: WorkflowInput) => ({
  404: `GitHub can't find the workflow ${input.workflow} in ${input.owner}/${input.repository}: use its file name, such as deploy.yml`,
});

const RunInput = WorkflowInput.extend({
  ref: words(255),
  inputs: z.record(z.string().trim().min(1).max(100), Text.pipe(z.string().max(65_000))).optional(),
});

const Dispatched = z.object({
  workflow_run_id: z.int().optional(),
  html_url: z.url().optional(),
});

export const runWorkflow = appAction<GithubKeys, z.output<typeof RunInput>>({
  key: 'run_workflow',
  label: 'Run a workflow',
  description: 'Start a GitHub Actions workflow that has a workflow_dispatch trigger',
  fields: [
    ...REPO_FIELDS,
    WORKFLOW_FIELD,
    {
      key: 'ref',
      label: 'Branch or tag',
      type: 'text',
      required: true,
      placeholder: 'main',
    },
    {
      key: 'inputs',
      label: 'Inputs',
      type: 'key_values',
      required: false,
      description: 'Each input the workflow declares under workflow_dispatch, and its value',
    },
  ],
  outputs: [
    { key: 'runId', label: 'Run id', type: 'text' },
    { key: 'runUrl', label: 'Run link', type: 'text' },
  ],
  input: RunInput,
  async run({ client: keys, input }) {
    const run = parse(
      'GitHub',
      Dispatched,
      await explained(
        githubSend(keys, 'POST', workflowPath(input, '/dispatches'), {
          ref: input.ref,
          inputs: input.inputs ?? {},
          return_run_details: true,
        }),
        missing(input),
      ),
      'no workflow run',
    );

    return {
      runId: run.workflow_run_id === undefined ? '' : String(run.workflow_run_id),
      runUrl: run.html_url ?? '',
    };
  },
});

const switchWorkflow = (to: 'enable' | 'disable') =>
  appAction<GithubKeys, WorkflowInput>({
    key: `${to}_workflow`,
    label: to === 'enable' ? 'Turn on a workflow' : 'Turn off a workflow',
    description:
      to === 'enable'
        ? 'Let a turned-off workflow run again'
        : 'Stop a workflow from running until it is turned on again',
    fields: [...REPO_FIELDS, WORKFLOW_FIELD],
    outputs: [{ key: 'workflow', label: 'Workflow', type: 'text' }],
    input: WorkflowInput,
    async run({ client: keys, input }) {
      await explained(githubSend(keys, 'PUT', workflowPath(input, `/${to}`)), missing(input));

      return { workflow: input.workflow };
    },
  });

export const enableWorkflow = switchWorkflow('enable');

export const disableWorkflow = switchWorkflow('disable');

const Workflow = z.object({
  id: z.int(),
  name: z.string(),
  path: z.string(),
  state: z.string(),
  html_url: z.url(),
  badge_url: z.url().nullish(),
});

export const getWorkflow = appAction<GithubKeys, WorkflowInput>({
  key: 'get_workflow',
  label: 'Get a workflow',
  description: 'Read a workflow’s name, file and whether it is turned on',
  fields: [...REPO_FIELDS, WORKFLOW_FIELD],
  outputs: [
    { key: 'workflowId', label: 'Workflow id', type: 'text' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'path', label: 'File', type: 'text' },
    { key: 'state', label: 'State', type: 'text' },
    { key: 'url', label: 'Workflow link', type: 'text' },
    { key: 'badgeUrl', label: 'Badge link', type: 'text' },
  ],
  input: WorkflowInput,
  async run({ client: keys, input }) {
    const workflow = parse(
      'GitHub',
      Workflow,
      await explained(githubSend(keys, 'GET', workflowPath(input)), missing(input)),
      'no workflow',
    );

    return {
      workflowId: String(workflow.id),
      name: workflow.name,
      path: workflow.path,
      state: workflow.state,
      url: workflow.html_url,
      badgeUrl: workflow.badge_url ?? '',
    };
  },
});

const ListInput = Repo.extend({ limit: Limit });

export const listWorkflows = appAction<GithubKeys, z.output<typeof ListInput>>({
  key: 'list_workflows',
  label: 'List workflows',
  description: 'The GitHub Actions workflows of a repository and their state',
  fields: [...REPO_FIELDS, LIMIT_FIELD],
  outputs: listOutputs('workflows', [
    { key: 'total', label: 'Workflows in the repository', type: 'number' },
  ]),
  input: ListInput,
  async run({ client: keys, input }) {
    const found = parse(
      'GitHub',
      z.object({ total_count: z.int(), workflows: z.array(Workflow) }),
      await githubSend(
        keys,
        'GET',
        withQuery(repoPath(input, '/actions/workflows'), { per_page: input.limit }),
      ),
      'no workflows',
    );

    return {
      ...listed(found.workflows.map((item) => `${item.name} (${item.path}): ${item.state}`)),
      total: found.total_count,
    };
  },
});
