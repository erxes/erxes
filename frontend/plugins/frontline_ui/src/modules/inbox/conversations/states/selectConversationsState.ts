import { atom } from 'jotai';

export const selectConversationsState = atom<string[]>([]);

export const setSelectConversationsState = atom(
  null,
  (get, set, conversationId: string) => {
    const isChecked = get(selectConversationsState).includes(conversationId);
    if (isChecked) {
      set(
        selectConversationsState,
        get(selectConversationsState).filter((id) => id !== conversationId),
      );
    } else {
      set(selectConversationsState, [
        ...get(selectConversationsState),
        conversationId,
      ]);
    }
  },
);
