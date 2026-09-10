import { atom } from 'jotai';

export const isOpenFacebookBotSecondarySheet = atom<boolean>(false);

export type TFacebookBotFormTab = 'settings' | 'activity';

/**
 * Which tab the bot form opens on. Session state, not a stored preference:
 * reopening a bot while working on its delivery should land back on Activity
 * rather than making the tab a two-click ritual every time.
 */
export const facebookBotFormTabState = atom<TFacebookBotFormTab>('settings');
