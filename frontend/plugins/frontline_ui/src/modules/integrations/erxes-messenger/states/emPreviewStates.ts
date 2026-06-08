import { atom } from 'jotai';

type TabType = 'default' | 'messages' | 'faq' | 'ticket' | 'web-call' | 'chat';

export const emPreviewActiveTabAtom = atom<TabType>('default');

export const emPreviewChatIsExpanded = atom<boolean>(false);

export const emPreviewWebsiteAppUrl = atom<string | undefined>();
export const emPreviewWebsiteAppHeaderTitle = atom<string | undefined>();
export const emPreviewHasChatContext = atom<boolean>(false);

export const emPreviewTabAtom = atom(
  (get) => get(emPreviewActiveTabAtom),
  (_, set, update: TabType) => {
    set(emPreviewActiveTabAtom, update);
  },
);
