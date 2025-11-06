import { atom } from 'jotai';
import {
  IBrowserInfo,
  IConnectionInfo,
  IWidgetUiOptions,
} from '../types/connection';
import { IMessage } from '../types';

export const messengerTabAtom = atom<string>('default');
export const setActiveTabAtom = atom(null, (get, set, tab: string) => {
  set(messengerTabAtom, tab);
});
export const resetTabAtom = atom(null, (get, set) => {
  set(messengerTabAtom, 'default');
});

export const connectionAtom = atom<IConnectionInfo>({
  widgetsMessengerConnect: {},
  browserInfo: {},
});

export const uiOptionsAtom = atom<IWidgetUiOptions>({
  color: '#fff',
  textColor: '#000',
  logo: '',
});

export const conversationIdAtom = atom<string | null>(null);
export const integrationIdAtom = atom<string | null>(null);

export const setConversationIdAtom = atom(
  null,
  (get, set, conversationId: string | null) => {
    set(conversationIdAtom, conversationId);
  },
);

export const lastUnreadMessageAtom = atom<IMessage | null>(null);

export const isBrowserInfoSavedAtom = atom<boolean>(false);
export const setIsBrowserInfoSavedAtom = atom(
  null,
  (get, set, isBrowserInfoSaved: boolean) => {
    set(isBrowserInfoSavedAtom, isBrowserInfoSaved);
  },
);
export const resetIsBrowserInfoSavedAtom = atom(null, (get, set) => {
  set(isBrowserInfoSavedAtom, false);
});
export const browserInfoAtom = atom<IBrowserInfo | null>(null);
