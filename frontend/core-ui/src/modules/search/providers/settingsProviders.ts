import { IconUsers } from '@tabler/icons-react';
import { defineSearchProvider, readCursorList } from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TTeamMemberNode = {
  _id: string;
  email?: string | null;
  username?: string | null;
  details?: { fullName?: string | null } | null;
};

export const teamMembersSearchProvider = defineSearchProvider<TTeamMemberNode>({
  key: 'core-team-members',
  label: 'Team members',
  labelKey: 'team-members',
  labelNamespace: 'common',
  icon: IconUsers,
  order: 30,
  selections: [
    {
      alias: 'gs_core_team_members',
      field: 'users',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward',
      body: '{ list { _id email username details { fullName } } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TTeamMemberNode>(payload, 'gs_core_team_members'),
  toItem: (member) => ({
    id: member._id,
    title: member.details?.fullName || member.username || UNNAMED,
    description: member.email || undefined,
    path: `/settings/team/members?user_id=${member._id}`,
  }),
});
