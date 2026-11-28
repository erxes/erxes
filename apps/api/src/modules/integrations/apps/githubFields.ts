import type { DataField } from '@erxes/core-contract';
import { z } from 'zod';

type Value = string | number | boolean | null | undefined;

type Kind = 'text' | 'number' | 'boolean' | 'date';

type Spec<T> = readonly (readonly [
  key: string,
  label: string,
  type: Kind,
  value: (data: T) => Value,
  recordType?: string,
])[];

type Row = Record<string, unknown>;

export interface Part {
  outputs: DataField[];
  read(body: Row): Row;
}

export const Str = z.string().nullish();

export const Num = z.number().nullish();

export const Flag = z.boolean().nullish();

export const User = z
  .looseObject({
    login: z.string(),
    id: Num,
    html_url: Str,
    type: Str,
    avatar_url: Str,
  })
  .nullish();

export const Logins = z.array(z.looseObject({ login: z.string() })).nullish();

export const Names = z.array(z.looseObject({ name: z.string() })).nullish();

export const logins = (list: z.output<typeof Logins>) => list?.map((user) => user.login).join(', ');

export const names = (list: z.output<typeof Names>) => list?.map((item) => item.name).join(', ');

export const part = <S extends z.ZodType>(
  path: string | null,
  schema: S,
  spec: Spec<z.output<S>>,
): Part => ({
  outputs: spec.map(([key, label, type, , recordType]) => ({
    key,
    label,
    type,
    ...(recordType && { recordType }),
  })),
  read(body) {
    const parsed = schema.safeParse(path === null ? body : body[path]);

    if (!parsed.success) return {};

    return Object.fromEntries(
      spec.flatMap(([key, , , value]) => {
        const found = value(parsed.data);

        return found === null || found === undefined ? [] : [[key, found]];
      }),
    );
  },
});

export const merge = (...parts: Part[]): Part => ({
  outputs: parts.flatMap((each) => each.outputs),
  read: (body) => Object.fromEntries(parts.flatMap((each) => Object.entries(each.read(body)))),
});

const repository = part(
  'repository',
  z.looseObject({
    full_name: Str,
    name: Str,
    owner: User,
    html_url: Str,
    default_branch: Str,
    private: Flag,
    description: Str,
    stargazers_count: Num,
    forks_count: Num,
    open_issues_count: Num,
  }),
  [
    ['repository_name', 'Repository', 'text', (repo) => repo.full_name],
    ['repositoryName', 'Repository name', 'text', (repo) => repo.name, 'repository'],
    ['repositoryOwner', 'Repository owner', 'text', (repo) => repo.owner?.login, 'owner'],
    ['repositoryUrl', 'Repository link', 'text', (repo) => repo.html_url],
    ['repositoryDefaultBranch', 'Default branch', 'text', (repo) => repo.default_branch],
    ['repositoryPrivate', 'Private repository', 'boolean', (repo) => repo.private],
    ['repositoryDescription', 'Repository description', 'text', (repo) => repo.description],
    ['repositoryStars', 'Stars', 'number', (repo) => repo.stargazers_count],
    ['repositoryForks', 'Forks', 'number', (repo) => repo.forks_count],
    ['repositoryOpenIssues', 'Open issues', 'number', (repo) => repo.open_issues_count],
  ],
);

const sender = part('sender', User, [
  ['sender_login', 'GitHub user', 'text', (user) => user?.login],
  ['senderId', 'GitHub user ID', 'number', (user) => user?.id],
  ['senderUrl', 'GitHub user link', 'text', (user) => user?.html_url],
  ['senderType', 'GitHub user type', 'text', (user) => user?.type],
  ['senderAvatarUrl', 'GitHub user picture', 'text', (user) => user?.avatar_url],
]);

const organization = part('organization', User, [
  ['organizationLogin', 'Organization', 'text', (org) => org?.login, 'organization'],
]);

export const BASE = merge(repository, sender, organization);

export const withAction = (...parts: Part[]) =>
  merge(
    part(null, z.looseObject({ action: Str }), [
      ['action', 'Action', 'text', (body) => body.action],
    ]),
    BASE,
    ...parts,
  );
