import type { INoteAttachment } from '@/activity/types';
import type { IBlockEditor } from 'erxes-ui';
import { atom, useStore } from 'jotai';
import { useEffect } from 'react';
import type { IRecordPanelProps } from 'ui-modules';

export interface IFrontlinePanelDraft {
  key: string | null;
  note?: {
    blocks: IBlockEditor['document'];
    isInternal: boolean;
    attachments: INoteAttachment[];
  };
}

export const frontlinePanelDraftState = atom<IFrontlinePanelDraft>({
  key: null,
});

export const useRecordPanelDraftSession = ({
  contentType,
  contentId,
  view,
}: IRecordPanelProps): void => {
  const store = useStore();
  const key = `${contentType}:${contentId}`;

  useEffect(() => {
    if (view !== 'title') return;
    store.set(frontlinePanelDraftState, (current) =>
      current.key === key ? current : { key },
    );
    return () => {
      store.set(frontlinePanelDraftState, (current) =>
        current.key === key ? { key: null } : current,
      );
    };
  }, [key, store, view]);
};
