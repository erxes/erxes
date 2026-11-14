import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import {
  articleMediaSlotsState,
  getArticleSlotKey,
} from '@/knowledgebase/articles/states/articleMediaSlotsState';
import { ARTICLE_MEDIA_TAB } from '@/knowledgebase/constants';

export const ArticleMediaSlot = ({
  articleId,
  tab = ARTICLE_MEDIA_TAB,
}: {
  articleId: string;
  tab?: string;
}) => {
  const setSlots = useSetAtom(articleMediaSlotsState);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!node) return;
    const slotKey = getArticleSlotKey(articleId, tab);
    setSlots((previous) => ({ ...previous, [slotKey]: node }));
    return () =>
      setSlots((previous) =>
        previous[slotKey] === node
          ? Object.fromEntries(
              Object.entries(previous).filter(([key]) => key !== slotKey),
            )
          : previous,
      );
  }, [node, articleId, tab, setSlots]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div ref={setNode} className="flex flex-col gap-1 p-3" />
    </div>
  );
};
