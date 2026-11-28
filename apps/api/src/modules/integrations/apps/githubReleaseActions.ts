import { z } from 'zod';
import { appAction, parse } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';
import {
  Body,
  explained,
  type GithubKeys,
  inRepository,
  LIMIT_FIELD,
  Limit,
  listed,
  listOutputs,
  loginOf,
  REPO_FIELDS,
  Repo,
  repoPath,
  User,
  withQuery,
  words,
} from './githubInputs';

const Release = z.object({
  id: z.int(),
  html_url: z.url(),
  tag_name: z.string(),
  name: z.string().nullish(),
  body: z.string().nullish(),
  draft: z.boolean(),
  prerelease: z.boolean(),
  author: User.nullish(),
  published_at: z.string().nullish(),
});

type Release = z.output<typeof Release>;

const RELEASE_OUTPUTS = [
  { key: 'releaseId', label: 'Release id', type: 'text' },
  { key: 'url', label: 'Release link', type: 'text' },
  { key: 'tag', label: 'Tag', type: 'text', recordType: 'release' },
] as const;

const releaseOutput = (release: Release) => ({
  releaseId: String(release.id),
  url: release.html_url,
  tag: release.tag_name,
});

const RELEASE_FIELD = inRepository('release', 'Release', 'release');

const Details = z.object({
  name: words(256).optional(),
  body: Body.optional(),
  draft: z.boolean().optional(),
  prerelease: z.boolean().optional(),
  target: words(255).optional(),
});

const DETAIL_FIELDS = [
  { key: 'name', label: 'Title', type: 'text', required: false },
  { key: 'body', label: 'Notes', type: 'longtext', required: false },
  { key: 'draft', label: 'Draft', type: 'boolean', required: false },
  { key: 'prerelease', label: 'Pre-release', type: 'boolean', required: false },
  {
    key: 'target',
    label: 'Branch or commit',
    type: 'text',
    required: false,
    description: 'Where a new tag points; blank: the default branch',
  },
] as const;

const detailBody = (input: z.output<typeof Details>) => ({
  name: input.name,
  body: input.body,
  draft: input.draft,
  prerelease: input.prerelease,
  target_commitish: input.target,
});

const fetchRelease = async (keys: GithubKeys, repo: Repo, release: string) => {
  const path = /^\d+$/.test(release)
    ? `/releases/${release}`
    : `/releases/tags/${encodeURIComponent(release)}`;

  return parse(
    'GitHub',
    Release,
    await explained(githubSend(keys, 'GET', repoPath(repo, path)), {
      404: `${repo.owner}/${repo.repository} has no release ${release}`,
    }),
    'no release',
  );
};

const CreateInput = Repo.extend({ tag: words(255) }).extend(Details.shape);

export const createRelease = appAction<GithubKeys, z.output<typeof CreateInput>>({
  key: 'create_release',
  label: 'Create a release',
  description: 'Publish a release on a tag, making the tag when it doesn’t exist',
  fields: [
    ...REPO_FIELDS,
    { key: 'tag', label: 'Tag', type: 'text', required: true, placeholder: 'v1.2.0' },
    ...DETAIL_FIELDS,
  ],
  outputs: [...RELEASE_OUTPUTS],
  input: CreateInput,
  async run({ client: keys, input }) {
    const release = parse(
      'GitHub',
      Release,
      await githubSend(keys, 'POST', repoPath(input, '/releases'), {
        tag_name: input.tag,
        ...detailBody(input),
      }),
      'no release',
    );

    return releaseOutput(release);
  },
});

const ReleaseInput = Repo.extend({ release: words(255) });

export const getRelease = appAction<GithubKeys, z.output<typeof ReleaseInput>>({
  key: 'get_release',
  label: 'Get a release',
  description: 'Read a release’s title, notes and state',
  fields: [...REPO_FIELDS, RELEASE_FIELD],
  outputs: [
    ...RELEASE_OUTPUTS,
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' },
    { key: 'draft', label: 'Draft', type: 'boolean' },
    { key: 'prerelease', label: 'Pre-release', type: 'boolean' },
    { key: 'author', label: 'Author', type: 'text' },
    { key: 'publishedAt', label: 'Published at', type: 'date' },
  ],
  input: ReleaseInput,
  async run({ client: keys, input }) {
    const release = await fetchRelease(keys, input, input.release);

    return {
      ...releaseOutput(release),
      title: release.name ?? '',
      notes: release.body ?? '',
      draft: release.draft,
      prerelease: release.prerelease,
      author: loginOf(release.author),
      publishedAt: release.published_at ?? null,
    };
  },
});

const ListInput = Repo.extend({ limit: Limit });

export const listReleases = appAction<GithubKeys, z.output<typeof ListInput>>({
  key: 'list_releases',
  label: 'List releases',
  description: 'The newest releases of a repository, drafts included',
  fields: [...REPO_FIELDS, LIMIT_FIELD],
  outputs: listOutputs('releases', [
    { key: 'latestTag', label: 'Newest tag', type: 'text' },
    { key: 'latestUrl', label: 'Newest release link', type: 'text' },
  ]),
  input: ListInput,
  async run({ client: keys, input }) {
    const releases = parse(
      'GitHub',
      z.array(Release),
      await githubSend(
        keys,
        'GET',
        withQuery(repoPath(input, '/releases'), { per_page: input.limit }),
      ),
      'no releases',
    );

    return {
      ...listed(releases.map((release) => `${release.tag_name} ${release.name ?? ''}`.trim())),
      latestTag: releases[0]?.tag_name ?? '',
      latestUrl: releases[0]?.html_url ?? '',
    };
  },
});

const UpdateInput = ReleaseInput.extend({ tag: words(255).optional() }).extend(Details.shape);

export const updateRelease = appAction<GithubKeys, z.output<typeof UpdateInput>>({
  key: 'update_release',
  label: 'Update a release',
  description: 'Change a release’s tag, title, notes or state; blank keeps them',
  fields: [
    ...REPO_FIELDS,
    RELEASE_FIELD,
    { key: 'tag', label: 'New tag', type: 'text', required: false },
    ...DETAIL_FIELDS,
  ],
  outputs: [...RELEASE_OUTPUTS],
  input: UpdateInput,
  async run({ client: keys, input }) {
    const { id } = await fetchRelease(keys, input, input.release);

    const release = parse(
      'GitHub',
      Release,
      await githubSend(keys, 'PATCH', repoPath(input, `/releases/${id}`), {
        tag_name: input.tag,
        ...detailBody(input),
      }),
      'no release',
    );

    return releaseOutput(release);
  },
});

export const deleteRelease = appAction<GithubKeys, z.output<typeof ReleaseInput>>({
  key: 'delete_release',
  label: 'Delete a release',
  description: 'Remove the release; its tag stays',
  fields: [...REPO_FIELDS, RELEASE_FIELD],
  outputs: [...RELEASE_OUTPUTS],
  input: ReleaseInput,
  async run({ client: keys, input }) {
    const release = await fetchRelease(keys, input, input.release);

    await githubSend(keys, 'DELETE', repoPath(input, `/releases/${release.id}`));

    return releaseOutput(release);
  },
});
