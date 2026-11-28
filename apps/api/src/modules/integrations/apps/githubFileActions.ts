import type { ActionField } from '@erxes/core-contract';
import { z } from 'zod';
import { appAction, GatewayError, parse, Text } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';
import {
  explained,
  filePath,
  type GithubKeys,
  listed,
  listOutputs,
  REPO_FIELDS,
  Repo,
  repoPath,
  withQuery,
  words,
} from './githubInputs';

const PATH_FIELD = {
  key: 'path',
  label: 'File path',
  type: 'text',
  required: true,
  placeholder: 'docs/changelog.md',
} as const;

const BRANCH_FIELD = {
  key: 'branch',
  label: 'Branch',
  type: 'text',
  required: false,
  description: 'Blank: the default branch',
} as const;

const REF_FIELD = {
  key: 'ref',
  label: 'Branch, tag or commit',
  type: 'text',
  required: false,
  description: 'Blank: the default branch',
} as const;

const MESSAGE_FIELD = {
  key: 'message',
  label: 'Commit message',
  type: 'text',
  required: true,
} as const;

const FileInput = Repo.extend({ path: words(1000), branch: words(255).optional() });

type Located = Repo & { path: string };

const Entry = z.object({
  type: z.string(),
  name: z.string(),
  path: z.string(),
  sha: z.string(),
  size: z.int(),
  html_url: z.url().nullish(),
  content: z.string().optional(),
  encoding: z.string().optional(),
});

const Contents = z.union([z.array(Entry), Entry]);

const contentsPath = (input: Located, ref?: string) =>
  withQuery(repoPath(input, `/contents/${filePath(input.path)}`), { ref });

const contentsAt = async (keys: GithubKeys, input: Located, ref?: string) =>
  parse(
    'GitHub',
    Contents,
    await explained(githubSend(keys, 'GET', contentsPath(input, ref)), {
      404: `${input.owner}/${input.repository} has nothing at ${input.path || 'its top folder'}${ref ? ` on ${ref}` : ''}`,
    }),
    'no file',
  );

const fileAt = async (keys: GithubKeys, input: Located, ref?: string) => {
  const found = await contentsAt(keys, input, ref);

  if (Array.isArray(found) || found.type !== 'file')
    throw new GatewayError(`${input.path} is a folder, not a file`, 400);

  return found;
};

const Committed = z.object({
  content: z.object({ sha: z.string(), html_url: z.url().nullish() }).nullish(),
  commit: z.object({ sha: z.string(), html_url: z.url().nullish() }),
});

const COMMIT_OUTPUTS = [
  { key: 'commitSha', label: 'Commit', type: 'text' },
  { key: 'commitUrl', label: 'Commit link', type: 'text' },
] as const;

const FILE_OUTPUTS = [
  ...COMMIT_OUTPUTS,
  { key: 'fileSha', label: 'File SHA', type: 'text' },
  { key: 'url', label: 'File link', type: 'text' },
] as const;

const committedOutput = (answer: z.output<typeof Committed>) => ({
  commitSha: answer.commit.sha,
  commitUrl: answer.commit.html_url ?? '',
  fileSha: answer.content?.sha ?? '',
  url: answer.content?.html_url ?? '',
});

const WriteInput = FileInput.extend({
  content: Text.pipe(z.string().max(1_000_000)),
  message: words(1000),
});

type WriteInput = z.output<typeof WriteInput>;

const writeFile = async (keys: GithubKeys, input: WriteInput, sha?: string) =>
  committedOutput(
    parse(
      'GitHub',
      Committed,
      await githubSend(keys, 'PUT', contentsPath(input), {
        message: input.message,
        content: Buffer.from(input.content).toString('base64'),
        branch: input.branch,
        sha,
      }),
      'no commit',
    ),
  );

const WRITE_FIELDS: ActionField[] = [
  ...REPO_FIELDS,
  PATH_FIELD,
  { key: 'content', label: 'Content', type: 'longtext', required: true },
  MESSAGE_FIELD,
  BRANCH_FIELD,
];

export const createFile = appAction<GithubKeys, WriteInput>({
  key: 'create_file',
  label: 'Create a file',
  description: 'Commit a new text file to a branch',
  fields: WRITE_FIELDS,
  outputs: [...FILE_OUTPUTS],
  input: WriteInput,
  run: ({ client: keys, input }) => writeFile(keys, input),
});

export const updateFile = appAction<GithubKeys, WriteInput>({
  key: 'update_file',
  label: 'Update a file',
  description: 'Commit new content for a text file that is already there',
  fields: WRITE_FIELDS,
  outputs: [...FILE_OUTPUTS],
  input: WriteInput,
  async run({ client: keys, input }) {
    const { sha } = await fileAt(keys, input, input.branch);

    return writeFile(keys, input, sha);
  },
});

const DeleteInput = FileInput.extend({ message: words(1000) });

export const deleteFile = appAction<GithubKeys, z.output<typeof DeleteInput>>({
  key: 'delete_file',
  label: 'Delete a file',
  description: 'Commit the removal of a file',
  fields: [...REPO_FIELDS, PATH_FIELD, MESSAGE_FIELD, BRANCH_FIELD],
  outputs: [...COMMIT_OUTPUTS],
  input: DeleteInput,
  async run({ client: keys, input }) {
    const { sha } = await fileAt(keys, input, input.branch);

    const answer = parse(
      'GitHub',
      Committed,
      await githubSend(keys, 'DELETE', contentsPath(input), {
        message: input.message,
        sha,
        branch: input.branch,
      }),
      'no commit',
    );

    return { commitSha: answer.commit.sha, commitUrl: answer.commit.html_url ?? '' };
  },
});

const ReadInput = Repo.extend({ path: words(1000), ref: words(255).optional() });

export const getFile = appAction<GithubKeys, z.output<typeof ReadInput>>({
  key: 'get_file',
  label: 'Get a file',
  description: 'Read a text file of up to 1 MB',
  fields: [...REPO_FIELDS, PATH_FIELD, REF_FIELD],
  outputs: [
    { key: 'content', label: 'Content', type: 'text' },
    { key: 'name', label: 'File name', type: 'text' },
    { key: 'size', label: 'Size in bytes', type: 'number' },
    { key: 'fileSha', label: 'File SHA', type: 'text' },
    { key: 'url', label: 'File link', type: 'text' },
  ],
  input: ReadInput,
  async run({ client: keys, input }) {
    const file = await fileAt(keys, input, input.ref);

    if (file.encoding !== 'base64')
      throw new GatewayError(`${file.path} is over 1 MB: GitHub only sends smaller files`, 400);

    return {
      content: Buffer.from(file.content ?? '', 'base64').toString('utf8'),
      name: file.name,
      size: file.size,
      fileSha: file.sha,
      url: file.html_url ?? '',
    };
  },
});

const ListInput = Repo.extend({ path: words(1000).optional(), ref: words(255).optional() });

export const listFiles = appAction<GithubKeys, z.output<typeof ListInput>>({
  key: 'list_files',
  label: 'List files',
  description: 'The files and folders in a folder of a repository',
  fields: [
    ...REPO_FIELDS,
    {
      ...PATH_FIELD,
      label: 'Folder',
      required: false,
      placeholder: 'docs',
      description: 'Blank: the top folder',
    },
    REF_FIELD,
  ],
  outputs: listOutputs('files and folders'),
  input: ListInput,
  async run({ client: keys, input }) {
    const found = await contentsAt(keys, { ...input, path: input.path ?? '' }, input.ref);

    if (!Array.isArray(found)) throw new GatewayError(`${found.path} is a file, not a folder`, 400);

    return listed(found.map((entry) => (entry.type === 'dir' ? `${entry.name}/` : entry.name)));
  },
});
