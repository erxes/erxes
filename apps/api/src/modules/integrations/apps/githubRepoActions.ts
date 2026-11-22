import { z } from 'zod';
import { appAction, parse } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';
import {
  explained,
  type GithubKeys,
  listed,
  listOutputs,
  REPO_FIELDS,
  Repo,
  repoPath,
} from './githubInputs';

const Repository = z.object({
  full_name: z.string(),
  html_url: z.url(),
  description: z.string().nullish(),
  default_branch: z.string(),
  private: z.boolean(),
  archived: z.boolean(),
  language: z.string().nullish(),
  stargazers_count: z.int(),
  forks_count: z.int(),
  open_issues_count: z.int(),
  pushed_at: z.string().nullish(),
});

export const getRepository = appAction<GithubKeys, Repo>({
  key: 'get_repository',
  label: 'Get a repository',
  description: 'Read a repository’s description, default branch and counts',
  fields: REPO_FIELDS,
  outputs: [
    { key: 'name', label: 'Full name', type: 'text' },
    { key: 'url', label: 'Repository link', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'defaultBranch', label: 'Default branch', type: 'text' },
    { key: 'private', label: 'Private', type: 'boolean' },
    { key: 'archived', label: 'Archived', type: 'boolean' },
    { key: 'language', label: 'Language', type: 'text' },
    { key: 'stars', label: 'Stars', type: 'number' },
    { key: 'forks', label: 'Forks', type: 'number' },
    { key: 'openIssues', label: 'Open issues and pull requests', type: 'number' },
    { key: 'pushedAt', label: 'Last push', type: 'date' },
  ],
  input: Repo,
  async run({ client: keys, input }) {
    const repo = parse(
      'GitHub',
      Repository,
      await githubSend(keys, 'GET', repoPath(input)),
      'no repository',
    );

    return {
      name: repo.full_name,
      url: repo.html_url,
      description: repo.description ?? '',
      defaultBranch: repo.default_branch,
      private: repo.private,
      archived: repo.archived,
      language: repo.language ?? '',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      pushedAt: repo.pushed_at ?? null,
    };
  },
});

const License = z.object({
  html_url: z.url().nullish(),
  license: z.object({ name: z.string(), spdx_id: z.string().nullish() }).nullish(),
});

export const getLicense = appAction<GithubKeys, Repo>({
  key: 'get_license',
  label: 'Get the license of a repository',
  description: 'Which license the repository’s license file holds',
  fields: REPO_FIELDS,
  outputs: [
    { key: 'name', label: 'License', type: 'text' },
    { key: 'spdxId', label: 'SPDX id', type: 'text' },
    { key: 'url', label: 'License file link', type: 'text' },
  ],
  input: Repo,
  async run({ client: keys, input }) {
    const found = parse(
      'GitHub',
      License,
      await explained(githubSend(keys, 'GET', repoPath(input, '/license')), {
        404: `${input.owner}/${input.repository} has no license file`,
      }),
      'no license',
    );

    return {
      name: found.license?.name ?? '',
      spdxId: found.license?.spdx_id ?? '',
      url: found.html_url ?? '',
    };
  },
});

const Present = z.object({}).loose().nullish();

const Profile = z.object({
  health_percentage: z.int(),
  description: z.string().nullish(),
  documentation: z.string().nullish(),
  files: z.object({
    readme: Present,
    license: Present,
    code_of_conduct: Present,
    contributing: Present,
    issue_template: Present,
    pull_request_template: Present,
  }),
});

export const getCommunityProfile = appAction<GithubKeys, Repo>({
  key: 'get_community_profile',
  label: 'Get the community profile of a repository',
  description: 'How complete its README, license, contributing guide and templates are',
  fields: REPO_FIELDS,
  outputs: [
    { key: 'health', label: 'Health percentage', type: 'number' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'documentation', label: 'Documentation link', type: 'text' },
    { key: 'hasReadme', label: 'Has a README', type: 'boolean' },
    { key: 'hasLicense', label: 'Has a license', type: 'boolean' },
    { key: 'hasCodeOfConduct', label: 'Has a code of conduct', type: 'boolean' },
    { key: 'hasContributing', label: 'Has a contributing guide', type: 'boolean' },
    { key: 'hasIssueTemplate', label: 'Has an issue template', type: 'boolean' },
    { key: 'hasPullRequestTemplate', label: 'Has a pull request template', type: 'boolean' },
  ],
  input: Repo,
  async run({ client: keys, input }) {
    const profile = parse(
      'GitHub',
      Profile,
      await githubSend(keys, 'GET', repoPath(input, '/community/profile')),
      'no community profile',
    );

    return {
      health: profile.health_percentage,
      description: profile.description ?? '',
      documentation: profile.documentation ?? '',
      hasReadme: Boolean(profile.files.readme),
      hasLicense: Boolean(profile.files.license),
      hasCodeOfConduct: Boolean(profile.files.code_of_conduct),
      hasContributing: Boolean(profile.files.contributing),
      hasIssueTemplate: Boolean(profile.files.issue_template),
      hasPullRequestTemplate: Boolean(profile.files.pull_request_template),
    };
  },
});

const PUSH_ACCESS = 'needs push access to the repository';

const trafficOf = async (keys: GithubKeys, input: Repo, path: string) =>
  parse(
    'GitHub',
    z.array(
      z.object({
        path: z.string().optional(),
        referrer: z.string().optional(),
        count: z.int(),
        uniques: z.int(),
      }),
    ),
    await githubSend(keys, 'GET', repoPath(input, `/traffic/popular/${path}`)),
    'no traffic',
  );

export const listPopularPaths = appAction<GithubKeys, Repo>({
  key: 'list_popular_paths',
  label: 'List the most viewed pages of a repository',
  description: `The top 10 pages over the last 14 days; ${PUSH_ACCESS}`,
  fields: REPO_FIELDS,
  outputs: listOutputs('pages', [
    { key: 'topPath', label: 'Most viewed page', type: 'text' },
    { key: 'topViews', label: 'Its views', type: 'number' },
  ]),
  input: Repo,
  async run({ client: keys, input }) {
    const paths = await trafficOf(keys, input, 'paths');

    return {
      ...listed(paths.map((item) => `${item.path ?? ''}: ${item.count} views`)),
      topPath: paths[0]?.path ?? '',
      topViews: paths[0]?.count ?? 0,
    };
  },
});

export const listReferrers = appAction<GithubKeys, Repo>({
  key: 'list_referrers',
  label: 'List the top referrers of a repository',
  description: `The top 10 sites sending visitors over the last 14 days; ${PUSH_ACCESS}`,
  fields: REPO_FIELDS,
  outputs: listOutputs('sites', [
    { key: 'topReferrer', label: 'Top site', type: 'text' },
    { key: 'topViews', label: 'Its views', type: 'number' },
  ]),
  input: Repo,
  async run({ client: keys, input }) {
    const referrers = await trafficOf(keys, input, 'referrers');

    return {
      ...listed(referrers.map((item) => `${item.referrer ?? ''}: ${item.count} views`)),
      topReferrer: referrers[0]?.referrer ?? '',
      topViews: referrers[0]?.count ?? 0,
    };
  },
});
