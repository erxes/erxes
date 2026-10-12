import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { kbSidebarOpenTopicIdsAtom } from '@/knowledgebase/sidebar/states/kbSidebarOpenTopicsState';

export const useTopicOpenState = (topicId?: string) => {
  const [openTopicIds, setOpenTopicIds] = useAtom(kbSidebarOpenTopicIdsAtom);

  const setOpen = useCallback(
    (open: boolean) => {
      if (!topicId) return;

      setOpenTopicIds((previous) => {
        if (previous.includes(topicId) === open) return previous;

        return open
          ? [...previous, topicId]
          : previous.filter((id) => id !== topicId);
      });
    },
    [topicId, setOpenTopicIds],
  );

  return {
    isOpen: !!topicId && openTopicIds.includes(topicId),
    setOpen,
  };
};
