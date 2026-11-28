import type { ActionField, DataField } from '@erxes/core-contract';
import { z } from 'zod';
import { GatewayError, Text } from '@erxes/plugin-sdk/integrations';

/** `installation`: an organisation's GitHub App token, which reads no /user endpoints. */
export type GithubKeys = { accessToken: string; installation?: true };

export const words = (max: number) => Text.pipe(z.string().trim().min(1).max(max));

export const Body = Text.pipe(z.string().max(65_000));

export const Whole = z.coerce.number().int().positive();

export const Limit = z.coerce.number().int().min(1).max(100).default(30);

export const Names = z
  .union([z.string(), z.array(z.string())])
  .transform((value) =>
    (Array.isArray(value) ? value : value.split(',')).map((name) => name.trim()).filter(Boolean),
  )
  .pipe(z.array(z.string().max(100)).max(20));

export const Repo = z.object({ owner: words(100), repository: words(100) });

export type Repo = z.output<typeof Repo>;

export const repoPath = ({ owner, repository }: Repo, path = '') =>
  `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}${path}`;

export const filePath = (path: string) =>
  path
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');

export const withQuery = (path: string, query: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value));

  const text = params.toString();

  return text ? `${path}?${text}` : path;
};

export const REPO_FIELDS: ActionField[] = [
  { key: 'owner', label: 'Owner', type: 'plugin_record', recordType: 'owner', required: true },
  {
    key: 'repository',
    label: 'Repository',
    type: 'plugin_record',
    recordType: 'repository',
    dependsOn: 'owner',
    required: true,
  },
];

/** One of the repository's records (`issue`, `workflow`), picked from its list or the run. */
export const inRepository = (key: string, label: string, recordType: string): ActionField => ({
  key,
  label,
  type: 'plugin_record',
  recordType,
  dependsOn: 'repository',
  required: true,
});

export const ISSUE_NUMBER = inRepository('number', 'Issue', 'issue');

export const PULL_NUMBER = inRepository('number', 'Pull request', 'pull');

export const LIMIT_FIELD: ActionField = {
  key: 'limit',
  label: 'How many',
  type: 'number',
  required: false,
  placeholder: '30',
  description: 'Up to 100',
};

export const namesField = (key: string, label: string, placeholder: string): ActionField => ({
  key,
  label,
  type: 'text',
  required: false,
  placeholder,
  description: 'Comma separated',
});

export const choice = <const T extends readonly string[]>(
  key: string,
  label: string,
  list: T,
  labels: NoInfer<Record<T[number], string>>,
): ActionField => ({
  key,
  label,
  type: 'select',
  required: false,
  options: list.map((value: T[number]) => ({ value, label: labels[value] })),
});

export const listOutputs = (noun: string, first: DataField[] = []): DataField[] => [
  { key: 'count', label: `Number of ${noun}`, type: 'number' },
  { key: 'list', label: `List of ${noun}`, type: 'text' },
  ...first,
];

export const listed = (lines: string[]) => ({ count: lines.length, list: lines.join('\n') });

export const statusOf = (error: unknown) => (error instanceof GatewayError ? error.status : null);

export const explained = async <T>(work: Promise<T>, messages: Record<number, string>) => {
  try {
    return await work;
  } catch (error) {
    const status = statusOf(error);
    const message = status === null ? undefined : messages[status];

    if (message) throw new GatewayError(message, status);

    throw error;
  }
};

export const User = z.object({ login: z.string() });

export const loginOf = (user: z.output<typeof User> | null | undefined) => user?.login ?? '';
