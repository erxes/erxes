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

export const TEAM_MEMBER_CURSOR_SESSION_KEY = 'core_team_members_cursor';

/** The team members list's id: its filter's, and the key its conditions live under in the address. */
export const TEAM_MEMBER_LIST = 'team-members';

export const TEAM_MEMBERS_HOTKEY_SCOPE = 'core-team-members-page';

export const USER_LINK_FIELDS: { label: string; name: UserLinkName; Icon: Icon }[] = [
  { label: 'Facebook', name: 'facebook', Icon: IconBrandFacebook },
  { label: 'Twitter', name: 'twitter', Icon: IconBrandX },
  { label: 'Website', name: 'website', Icon: IconWorldWww },
  { label: 'Discord', name: 'discord', Icon: IconBrandDiscord },
  { label: 'GitHub', name: 'github', Icon: IconBrandGithub },
  { label: 'Instagram', name: 'instagram', Icon: IconBrandInstagram },
];
