import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { kbSidebarOpenTopicIdAtom } from '@/knowledgebase/sidebar/states/kbSidebarOpenTopicState';

export const useTopicOpenState = (topicId?: string) => {
  const [openTopicId, setOpenTopicId] = useAtom(kbSidebarOpenTopicIdAtom);

  const setOpen = useCallback(
    (open: boolean) => {
      if (!topicId) return;

      setOpenTopicId((current) => {
        if (open) return topicId;

        return current === topicId ? null : current;
      });
    },
    [topicId, setOpenTopicId],
  );

  return {
    isOpen: !!topicId && openTopicId === topicId,
    setOpen,
  };
};
