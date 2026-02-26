import { atom } from 'jotai';
import {
  IBrowserInfo,
  IConnectionInfo,
  ICustomerData,
  IMessengerData,
  ITicketConfig,
  IWidgetUiOptions,
} from '../types/connection';
import { IHeaderItem, IMessage } from '../types';
import { HEADER_ITEMS } from '../constants';
import { ITicketCheckProgress } from '../ticket/types';

export const customerIdAtom = atom<string | null>(null);

export const customerDataAtom = atom<ICustomerData | null>(null);

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
  primary: {
    DEFAULT: '#000000',
    foreground: '#ffffff',
  },
  logo: '',
});

export const ticketConfigAtom = atom<ITicketConfig | null>(null);

export const hasTicketConfigAtom = atom<boolean>(false);

export const headerItemsAtom = atom<IHeaderItem[]>(HEADER_ITEMS);

export const conversationIdAtom = atom<string | null>(null);
export const integrationIdAtom = atom<string | null>(null);

export const messengerDataAtom = atom<IMessengerData | null>(null);

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

export const toastUserAtom = atom<boolean>(false);

export const ticketProgressAtom = atom<ITicketCheckProgress | null>(null);

export const userTicketCreatedNumberAtom = atom<string | null>(null);
