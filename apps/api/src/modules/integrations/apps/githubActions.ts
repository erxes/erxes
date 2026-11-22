import { z } from 'zod';
import { appAction, parse, Text } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';

type GithubKeys = { accessToken: string };

const words = (max: number) => Text.pipe(z.string().trim().min(1).max(max));

const Labels = z
  .union([z.string(), z.array(z.string())])
  .transform((value) =>
    (Array.isArray(value) ? value : value.split(',')).map((label) => label.trim()).filter(Boolean),
  )
  .pipe(z.array(z.string().max(50)).max(20));

const IssueInput = z.object({
  owner: words(100),
  repository: words(100),
  title: words(256),
  body: Text.pipe(z.string().max(65_000)).optional(),
  labels: Labels.optional(),
});

const Issue = z.object({ number: z.int(), html_url: z.url() });

export const createIssue = appAction<GithubKeys, z.output<typeof IssueInput>>({
  key: 'create_issue',
  label: 'Create an issue',
  description: 'Open an issue in a repository',
  fields: [
    { key: 'owner', label: 'Owner', type: 'text', required: true, placeholder: 'acme' },
    { key: 'repository', label: 'Repository', type: 'text', required: true, placeholder: 'shop' },
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'body', label: 'Text', type: 'longtext', required: false },
    {
      key: 'labels',
      label: 'Labels',
      type: 'text',
      required: false,
      placeholder: 'bug, customer',
      description: 'Comma separated; labels the repository has',
    },
  ],
  outputs: [
    { key: 'number', label: 'Issue number', type: 'number' },
    { key: 'url', label: 'Issue link', type: 'text' },
  ],
  input: IssueInput,
  async run({ client: keys, input }) {
    const path = `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repository)}/issues`;

    const issue = parse(
      'GitHub',
      Issue,
      await githubSend(keys, 'POST', path, {
        title: input.title,
        body: input.body,
        labels: input.labels,
      }),
      'no issue',
    );

    return { number: issue.number, url: issue.html_url };
  },
});
