import { useMemo, useState } from 'react';
import type { ISidePanelNavigator } from '~/modules/side-panel/recordView';
import type { TRelationEntity } from '~/modules/side-panel/sidePanelPaths';

interface Shown {
  record: TRelationEntity;
  tab: string;
}

const same = (a: TRelationEntity, b: TRelationEntity) =>
  a.contentType === b.contentType && a.contentId === b.contentId;

/** Records opened from the chat, shown in the assistant's panel in its place; Back returns to the chat. */
export const useShownRecords = () => {
  const [stack, setStack] = useState<Shown[]>([]);
  const top = stack.at(-1) ?? null;

  const navigator = useMemo<ISidePanelNavigator | null>(() => {
    if (!top) return null;

    const replaceTop = (next: Shown) => setStack((shown) => [...shown.slice(0, -1), next]);

    return {
      record: top.record,
      tab: top.tab,
      setTab: (tab) => replaceTop({ ...top, tab }),
      openRecord: (record, options) => {
        const next = { record, tab: options?.tab ?? '' };

        if (options?.replace) replaceTop(next);
        else setStack((shown) => [...shown, next]);
      },
      replaceRecord: (record) => replaceTop({ record, tab: '' }),
      back: () => setStack((shown) => shown.slice(0, -1)),
      canGoBack: true,
      close: () => setStack([]),
    };
  }, [top]);

  return {
    top,
    navigator,
    show: (record: TRelationEntity, tab = '') => setStack([{ record, tab }]),
    dismiss: (record: TRelationEntity) =>
      setStack((shown) => shown.filter((entry) => !same(entry.record, record))),
  };
};
