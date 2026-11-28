import { GITHUB_ORG_ROLES } from '@erxes/core-db/integrationEnums';
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
  User,
  withQuery,
  words,
} from './githubInputs';

const ORG_FIELD = {
  key: 'organization',
  label: 'Organization',
  type: 'plugin_record',
  recordType: 'organization',
  required: true,
} as const;

const Repository = z.object({ full_name: z.string(), html_url: z.url() });

const REPO_LIST_OUTPUTS = listOutputs('repositories', [
  { key: 'firstName', label: 'First repository', type: 'text' },
  { key: 'firstUrl', label: 'First repository link', type: 'text' },
]);

const repositories = async (keys: GithubKeys, path: string, limit: number) => {
  const repos = parse(
    'GitHub',
    z.array(Repository),
    await githubSend(keys, 'GET', withQuery(path, { per_page: limit, sort: 'updated' })),
    'no repositories',
  );

  return {
    ...listed(repos.map((repo) => repo.full_name)),
    firstName: repos[0]?.full_name ?? '',
    firstUrl: repos[0]?.html_url ?? '',
  };
};

const OrgInput = z.object({ organization: words(100), limit: Limit });

const orgPath = (organization: string, path: string) =>
  `/orgs/${encodeURIComponent(organization)}${path}`;

export const listOrgRepositories = appAction<GithubKeys, z.output<typeof OrgInput>>({
  key: 'list_org_repositories',
  label: 'List the repositories of an organization',
  description: 'Recently updated first',
  fields: [ORG_FIELD, LIMIT_FIELD],
  outputs: REPO_LIST_OUTPUTS,
  input: OrgInput,
  run: ({ client: keys, input }) =>
    repositories(keys, orgPath(input.organization, '/repos'), input.limit),
});

export const listOrgMembers = appAction<GithubKeys, z.output<typeof OrgInput>>({
  key: 'list_org_members',
  label: 'List the members of an organization',
  description: 'Their GitHub usernames',
  fields: [ORG_FIELD, LIMIT_FIELD],
  outputs: listOutputs('members'),
  input: OrgInput,
  async run({ client: keys, input }) {
    const members = parse(
      'GitHub',
      z.array(User),
      await githubSend(
        keys,
        'GET',
        withQuery(orgPath(input.organization, '/members'), { per_page: input.limit }),
      ),
      'no members',
    );

    return listed(members.map((member) => member.login));
  },
});

const UserInput = z.object({ user: words(100), limit: Limit });

export const listUserRepositories = appAction<GithubKeys, z.output<typeof UserInput>>({
  key: 'list_user_repositories',
  label: 'List the repositories of a user',
  description: 'Their public repositories, recently updated first',
  fields: [
    { key: 'user', label: 'GitHub username', type: 'text', required: true, placeholder: 'octocat' },
    LIMIT_FIELD,
  ],
  outputs: REPO_LIST_OUTPUTS,
  input: UserInput,
  run: ({ client: keys, input }) =>
    repositories(keys, `/users/${encodeURIComponent(input.user)}/repos`, input.limit),
});

const InviteInput = z.object({
  organization: words(100),
  email: z.email().trim().max(320),
  role: z.enum(GITHUB_ORG_ROLES).default('direct_member'),
});

const Invitation = z.object({ id: z.int(), role: z.string().nullish() });

export const inviteUser = appAction<GithubKeys, z.output<typeof InviteInput>>({
  key: 'invite_user',
  label: 'Invite someone to an organization',
  description: 'GitHub emails them an invitation to join',
  fields: [
    ORG_FIELD,
    { key: 'email', label: 'Email', type: 'text', required: true },
    {
      ...choice('role', 'Role', GITHUB_ORG_ROLES, {
        direct_member: 'Member',
        admin: 'Owner',
        billing_manager: 'Billing manager',
      }),
      description: 'Blank: member',
    },
  ],
  outputs: [
    { key: 'invitationId', label: 'Invitation id', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
  ],
  input: InviteInput,
  async run({ client: keys, input }) {
    const invitation = parse(
      'GitHub',
      Invitation,
      await githubSend(keys, 'POST', orgPath(input.organization, '/invitations'), {
        email: input.email,
        role: input.role,
      }),
      'no invitation',
    );

    return { invitationId: String(invitation.id), role: invitation.role ?? input.role };
  },
});
