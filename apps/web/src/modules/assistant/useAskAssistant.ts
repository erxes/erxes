import { useSetAtom } from 'jotai';
import { useCan } from '~/modules/auth/session';
import { assistantAskState, assistantOpenState, newChatAction } from './assistantState';

export const useAskAssistant = () => {
  const allowed = useCan()('assistant.chat');
  const setAsk = useSetAtom(assistantAskState);
  const setOpen = useSetAtom(assistantOpenState);
  const newChat = useSetAtom(newChatAction);

  const ask = (text: string) => {
    newChat();
    setAsk(text);
    setOpen(true);
  };

  return allowed ? ask : null;
};
