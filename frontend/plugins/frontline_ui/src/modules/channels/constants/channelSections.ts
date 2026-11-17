import {
  IconForms,
  IconGitBranch,
  IconListCheck,
  IconMessageReply,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import type { ElementType } from 'react';

export type TChannelSection = {
  segment: string;
  labelKey: string;
  defaultLabel: string;
  icon: ElementType;
};

const GENERAL_SECTION = {
  segment: 'general',
  labelKey: 'general',
  defaultLabel: 'General',
  icon: IconSettings,
} as const;

export const CHANNEL_SECTIONS = [
  GENERAL_SECTION,
  {
    segment: 'members',
    labelKey: 'members-title',
    defaultLabel: 'Members',
    icon: IconUsers,
  },
  {
    segment: 'pipelines',
    labelKey: 'pipelines',
    defaultLabel: 'Pipelines',
    icon: IconGitBranch,
  },
  {
    segment: 'forms',
    labelKey: 'forms',
    defaultLabel: 'Forms',
    icon: IconForms,
  },
  {
    segment: 'surveys',
    labelKey: 'surveys',
    defaultLabel: 'Surveys',
    icon: IconListCheck,
  },
  {
    segment: 'response',
    labelKey: 'response-templates',
    defaultLabel: 'Response templates',
    icon: IconMessageReply,
  },
] as const satisfies readonly TChannelSection[];

export const PERSONAL_CHANNEL_SECTIONS = [
  GENERAL_SECTION,
] as const satisfies readonly TChannelSection[];

export type TChannelSectionSegment =
  (typeof CHANNEL_SECTIONS)[number]['segment'];

export const DEFAULT_CHANNEL_SECTION: TChannelSectionSegment = 'members';

export const CHANNEL_SETTINGS_PATH = 'frontline/settings/channels';

export const PERSONAL_CHANNEL_SETTINGS_PATH =
  'frontline/settings/personal-channel';

export type TChannelWorkspacePaths = {
  sections: string;
  integrations: string;
};

export const getChannelWorkspacePaths = (
  channelId: string,
): TChannelWorkspacePaths => ({
  sections: `${CHANNEL_SETTINGS_PATH}/${channelId}`,
  integrations: `${CHANNEL_SETTINGS_PATH}/details/${channelId}`,
});

export const getPersonalChannelWorkspacePaths = (
  channelId: string,
): TChannelWorkspacePaths => ({
  sections: PERSONAL_CHANNEL_SETTINGS_PATH,
  integrations: `${PERSONAL_CHANNEL_SETTINGS_PATH}/details/${channelId}`,
});
