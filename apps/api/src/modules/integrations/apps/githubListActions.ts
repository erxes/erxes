import type { ActionField } from '@erxes/core-contract';
import {
  GITHUB_ISSUE_FILTERS,
  GITHUB_ISSUE_SORTS,
  GITHUB_LIST_STATES,
  GITHUB_PULL_SORTS,
  GITHUB_SORT_DIRECTIONS,
} from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { appAction, parse } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';
import {
  choice,
  type GithubKeys,
  LIMIT_FIELD,
  Limit,
  listed,
  listOutputs,
  Names,
  namesField,
  REPO_FIELDS,
  Repo,
  repoPath,
  withQuery,
  words,
} from './githubInputs';

const Thread = z.object({
  number: z.int(),
  title: z.string(),
  html_url: z.url(),
  pull_request: z.object({}).loose().optional(),
  repository: z.object({ full_name: z.string() }).optional(),
});

type Thread = z.output<typeof Thread>;

const firstOutputs = (noun: string) => [
  { key: 'firstNumber', label: `First ${noun} number`, type: 'number' as const },
  { key: 'firstTitle', label: `First ${noun} title`, type: 'text' as const },
  { key: 'firstUrl', label: `First ${noun} link`, type: 'text' as const },
];

const summary = (threads: Thread[]) => ({
  ...listed(
    threads.map(
      (thread) => `${thread.repository?.full_name ?? ''}#${thread.number} ${thread.title}`,
    ),
  ),
  firstNumber: threads[0]?.number ?? null,
  firstTitle: threads[0]?.title ?? '',
  firstUrl: threads[0]?.html_url ?? '',
});

const fetchThreads = async (keys: GithubKeys, path: string) =>
  parse('GitHub', z.array(Thread), await githubSend(keys, 'GET', path), 'no list');

const STATE_FIELD = choice('state', 'State', GITHUB_LIST_STATES, {
  open: 'Open',
  closed: 'Closed',
  all: 'Open and closed',
});

const DIRECTION_FIELD = choice('direction', 'Order', GITHUB_SORT_DIRECTIONS, {
  desc: 'Newest first',
  asc: 'Oldest first',
});

const ISSUE_SORT_FIELD = choice('sort', 'Sort by', GITHUB_ISSUE_SORTS, {
  created: 'Opened',
  updated: 'Last updated',
  comments: 'Comments',
});

const SINCE_FIELD: ActionField = {
  key: 'since',
  label: 'Updated since',
  type: 'date',
  required: false,
};

const Filters = z.object({
  state: z.enum(GITHUB_LIST_STATES).optional(),
  labels: Names.optional(),
  since: z.coerce.date().optional(),
  sort: z.enum(GITHUB_ISSUE_SORTS).optional(),
  direction: z.enum(GITHUB_SORT_DIRECTIONS).optional(),
  limit: Limit,
});

const filterQuery = (input: z.output<typeof Filters>) => ({
  state: input.state,
  labels: input.labels?.join(','),
  since: input.since?.toISOString(),
  sort: input.sort,
  direction: input.direction,
  per_page: input.limit,
});

const IssuesInput = Repo.extend(Filters.shape).extend({
  assignee: words(100).optional(),
  creator: words(100).optional(),
  mentioned: words(100).optional(),
});

const person = (key: string, label: string): ActionField => ({
  key,
  label,
  type: 'text',
  required: false,
  placeholder: 'octocat',
  description: 'A GitHub username',
});

export const listIssues = appAction<GithubKeys, z.output<typeof IssuesInput>>({
  key: 'list_issues',
  label: 'List the issues of a repository',
  description: 'Issues that match, pull requests left out',
  fields: [
    ...REPO_FIELDS,
    STATE_FIELD,
    namesField('labels', 'Labels', 'bug, customer'),
    person('assignee', 'Assigned to'),
    person('creator', 'Opened by'),
    person('mentioned', 'Mentions'),
    SINCE_FIELD,
    ISSUE_SORT_FIELD,
    DIRECTION_FIELD,
    LIMIT_FIELD,
  ],
  outputs: listOutputs('issues', firstOutputs('issue')),
  input: IssuesInput,
  async run({ client: keys, input }) {
    const threads = await fetchThreads(
      keys,
      withQuery(repoPath(input, '/issues'), {
        ...filterQuery(input),
        assignee: input.assignee,
        creator: input.creator,
        mentioned: input.mentioned,
      }),
    );

    return summary(threads.filter((thread) => !thread.pull_request));
  },
});

const PullsInput = Repo.extend({
  state: z.enum(GITHUB_LIST_STATES).optional(),
  sort: z.enum(GITHUB_PULL_SORTS).optional(),
  direction: z.enum(GITHUB_SORT_DIRECTIONS).optional(),
  limit: Limit,
});

export const listPullRequests = appAction<GithubKeys, z.output<typeof PullsInput>>({
  key: 'list_pull_requests',
  label: 'List the pull requests of a repository',
  description: 'Pull requests that match',
  fields: [
    ...REPO_FIELDS,
    STATE_FIELD,
    choice('sort', 'Sort by', GITHUB_PULL_SORTS, {
      created: 'Opened',
      updated: 'Last updated',
      popularity: 'Comments',
      'long-running': 'Open longest',
    }),
    DIRECTION_FIELD,
    LIMIT_FIELD,
  ],
  outputs: listOutputs('pull requests', firstOutputs('pull request')),
  input: PullsInput,
  async run({ client: keys, input }) {
    return summary(
      await fetchThreads(
        keys,
        withQuery(repoPath(input, '/pulls'), {
          state: input.state,
          sort: input.sort,
          direction: input.direction,
          per_page: input.limit,
        }),
      ),
    );
  },
});

const MineInput = Filters.extend({
  filter: z.enum(GITHUB_ISSUE_FILTERS).optional(),
});

export const listMyIssues = appAction<GithubKeys, z.output<typeof MineInput>>({
  key: 'list_my_issues',
  label: 'List your issues',
  description: 'Issues and pull requests of the connected account, across its repositories',
  fields: [
    choice('filter', 'Which', GITHUB_ISSUE_FILTERS, {
      assigned: 'Assigned to you',
      created: 'Opened by you',
      mentioned: 'Mentioning you',
      subscribed: 'You follow',
      all: 'All you can see',
    }),
    STATE_FIELD,
    namesField('labels', 'Labels', 'bug, customer'),
    SINCE_FIELD,
    ISSUE_SORT_FIELD,
    DIRECTION_FIELD,
    LIMIT_FIELD,
  ],
  outputs: listOutputs('issues', firstOutputs('issue')),
  input: MineInput,
  async run({ client: keys, input }) {
    return summary(
      await fetchThreads(
        keys,
        withQuery('/issues', { ...filterQuery(input), filter: input.filter }),
      ),
    );
  },
});
