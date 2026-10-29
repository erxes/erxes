import { atomWithStorage } from 'jotai/utils';

export const discordLinkBannerDismissedState = atomWithStorage<boolean>(
  'operation:discord-link-banner-dismissed',
  false,
  undefined,
  { getOnInit: true },
);
