import { conversationListHiddenState } from '@/inbox/states/conversationListHiddenState';
import { useAtom } from 'jotai';

export const useConversationListVisibility = (): {
  isHidden: boolean;
  toggle: () => void;
} => {
  const [isHidden, setIsHidden] = useAtom(conversationListHiddenState);

  return { isHidden, toggle: () => setIsHidden(!isHidden) };
};
