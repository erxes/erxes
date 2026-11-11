import type { UserLinkName } from '@erxes/core-contract';
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandX,
  IconWorldWww,
  type Icon,
} from '@tabler/icons-react';

/** Old core-ui `/settings/team/members` is `/settings/team-members` here. */
export const TEAM_MEMBERS_PATH = '/settings/team-members';

export const teamMemberPath = (id: string) => `${TEAM_MEMBERS_PATH}/${id}`;

/** The member open in the side panel beside the list (old `user_id`). */
export const MEMBER_PANEL_QUERY_KEY = 'user_id';

/** The member whose password is being set (old `reset_password_id`). */
export const RESET_PASSWORD_QUERY_KEY = 'reset_password_id';

export const TEAM_MEMBER_CURSOR_SESSION_KEY = 'core_team_members_cursor';

export const TEAM_MEMBERS_HOTKEY_SCOPE = 'core-team-members-page';

export const USER_LINK_FIELDS: { label: string; name: UserLinkName; Icon: Icon }[] = [
  { label: 'Facebook', name: 'facebook', Icon: IconBrandFacebook },
  { label: 'Twitter', name: 'twitter', Icon: IconBrandX },
  { label: 'Website', name: 'website', Icon: IconWorldWww },
  { label: 'Discord', name: 'discord', Icon: IconBrandDiscord },
  { label: 'GitHub', name: 'github', Icon: IconBrandGithub },
  { label: 'Instagram', name: 'instagram', Icon: IconBrandInstagram },
];
