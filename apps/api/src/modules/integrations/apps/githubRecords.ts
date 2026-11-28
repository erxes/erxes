import { z } from 'zod';
import { type AppRecords, parse } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';
import { type GithubKeys, repoPath, withQuery } from './githubInputs';

const PAGE = 100;

const Login = z.object({ login: z.string() });

const Repos = z.array(
  z.object({ name: z.string(), private: z.boolean().optional(), owner: Login }),
);

const Workflows = z.object({
  workflows: z.array(z.object({ name: z.string(), path: z.string() })),
});

const Threads = z.array(
  z.object({ number: z.int(), title: z.string(), pull_request: z.unknown().optional() }),
);

const Releases = z.array(z.object({ tag_name: z.string(), name: z.string().nullish() }));

const read = async <T>(keys: GithubKeys, path: string, schema: z.ZodType<T>) =>
  parse('GitHub', schema, await githubSend(keys, 'GET', path), `an unreadable ${path} answer`);

const InstalledRepos = z.object({ repositories: Repos });

const repos = async (keys: GithubKeys) =>
  keys.installation
    ? (
        await read(
          keys,
          withQuery('/installation/repositories', { per_page: PAGE }),
          InstalledRepos,
        )
      ).repositories
    : read(keys, withQuery('/user/repos', { per_page: PAGE, sort: 'updated' }), Repos);

/** The token's own login: none for an App token, which acts for an installation. */
const ownLogin = async (keys: GithubKeys) =>
  keys.installation ? [] : [(await read(keys, '/user', Login)).login];

const names = (list: string[]) => [...new Set(list)].map((name) => ({ value: name, label: name }));

const thread = (item: { number: number; title: string }) => ({
  value: String(item.number),
  label: `#${item.number} ${item.title}`,
});

/** A repository's records follow two inputs: the repository, then its owner. */
const repoOf = ([repository, owner]: string[]) =>
  repository && owner ? { owner, repository } : null;

const inRepo = async <T>(
  keys: GithubKeys,
  parents: string[],
  path: string,
  query: Record<string, string | number>,
  schema: z.ZodType<T>,
) => {
  const repo = repoOf(parents);

  return repo
    ? read(keys, withQuery(repoPath(repo, path), { ...query, per_page: PAGE }), schema)
    : null;
};

/**
 * The token's account and organizations, its recently updated repositories under an owner, and
 * a repository's workflows, open issues and pull requests, and releases.
 */
export const GITHUB_RECORDS: AppRecords<GithubKeys> = {
  owner: {
    async list({ client: keys }) {
      const [own, listed] = await Promise.all([ownLogin(keys), repos(keys)]);

      return names([...own, ...listed.map((repo) => repo.owner.login)]);
    },
  },
  organization: {
    async list({ client: keys }) {
      if (keys.installation) return names((await repos(keys)).map((repo) => repo.owner.login));

      const orgs = await read(keys, withQuery('/user/orgs', { per_page: PAGE }), z.array(Login));

      return names(orgs.map((org) => org.login));
    },
  },
  repository: {
    async list({ client: keys, parents: [owner] }) {
      if (!owner) return [];

      return (await repos(keys))
        .filter((repo) => repo.owner.login.toLowerCase() === owner.toLowerCase())
        .map((repo) => ({
          value: repo.name,
          label: repo.private ? `${repo.name} (private)` : repo.name,
        }));
    },
  },
  workflow: {
    async list({ client: keys, parents }) {
      const found = await inRepo(keys, parents, '/actions/workflows', {}, Workflows);

      return (found?.workflows ?? []).map((workflow) => {
        const file = workflow.path.split('/').at(-1) ?? workflow.path;

        return { value: file, label: `${workflow.name} (${file})` };
      });
    },
  },
  issue: {
    async list({ client: keys, parents }) {
      const issues = await inRepo(keys, parents, '/issues', { state: 'open' }, Threads);

      return (issues ?? []).filter((issue) => issue.pull_request === undefined).map(thread);
    },
  },
  pull: {
    async list({ client: keys, parents }) {
      return ((await inRepo(keys, parents, '/pulls', { state: 'open' }, Threads)) ?? []).map(
        thread,
      );
    },
  },
  release: {
    async list({ client: keys, parents }) {
      const releases = await inRepo(keys, parents, '/releases', {}, Releases);

      return (releases ?? []).map((release) => ({
        value: release.tag_name,
        label:
          release.name && release.name !== release.tag_name
            ? `${release.tag_name} · ${release.name}`
            : release.tag_name,
      }));
    },
  },
};
