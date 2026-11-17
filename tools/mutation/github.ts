import { setTimeout as sleep } from 'node:timers/promises';

const api = process.env.GITHUB_API_URL ?? 'https://api.github.com';
const repo = process.env.GITHUB_REPOSITORY ?? '';
const token = process.env.GITHUB_TOKEN ?? '';

type Json = Record<string, unknown>;

const isJson = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const request = async (method: string, path: string, body?: Json) => {
  const response = await fetch(`${api}/repos/${repo}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok)
    throw new Error(`GitHub ${method} ${path}: ${response.status} ${await response.text()}`);

  const data: unknown = response.status === 204 ? null : await response.json();

  // GitHub asks for a second between writes, or it starts refusing them.
  if (method !== 'GET') await sleep(1000);

  return data;
};

const pages = async (path: string) => {
  const rows: Json[] = [];

  for (let page = 1; ; page += 1) {
    const data = await request(
      'GET',
      `${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`,
    );

    const batch = Array.isArray(data) ? data.filter(isJson) : [];

    rows.push(...batch);

    if (batch.length < 100) return rows;
  }
};

export type Issue = { number: number; title: string; body: string };

const toIssue = (row: Json): Issue => ({
  number: typeof row.number === 'number' ? row.number : 0,
  title: typeof row.title === 'string' ? row.title : '',
  body: typeof row.body === 'string' ? row.body : '',
});

export const openIssues = async (label: string) =>
  (await pages(`/issues?state=open&labels=${encodeURIComponent(label)}`))
    .filter((row) => !('pull_request' in row))
    .map(toIssue);

export const ensureLabel = async (name: string, description: string) => {
  const labels = await pages('/labels');

  if (!labels.some((label) => label.name === name))
    await request('POST', '/labels', { name, color: 'b60205', description });
};

export const createIssue = (title: string, body: string, label: string) =>
  request('POST', '/issues', { title, body, labels: [label] });

export const updateIssue = (number: number, changes: Json) =>
  request('PATCH', `/issues/${number}`, changes);

export const comment = (number: number, body: string) =>
  request('POST', `/issues/${number}/comments`, { body });

/** Updates the issue or pull request comment that carries `marker`, or posts one. */
export const upsertComment = async (number: number, marker: string, body: string) => {
  const existing = (await pages(`/issues/${number}/comments`)).find(
    (row) => typeof row.body === 'string' && row.body.includes(marker),
  );

  if (existing && typeof existing.id === 'number')
    await request('PATCH', `/issues/comments/${existing.id}`, { body });
  else await comment(number, body);
};

/** The login of whoever last changed `path`, or '' when GitHub doesn't know one. */
export const lastAuthor = async (path: string, ref: string) => {
  const data = await request(
    'GET',
    `/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(ref)}&per_page=1`,
  );

  const [latest] = Array.isArray(data) ? data.filter(isJson) : [];
  const author = latest?.author;

  return isJson(author) && typeof author.login === 'string' ? author.login : '';
};
