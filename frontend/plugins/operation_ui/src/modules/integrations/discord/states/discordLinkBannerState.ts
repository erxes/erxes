import { atomWithStorage } from 'jotai/utils';

export const discordLinkBannerDismissedState = atomWithStorage<string[]>(
  'operation:discord-link-banner-dismissed-teams',
  [],
  undefined,
  { getOnInit: true },
);
