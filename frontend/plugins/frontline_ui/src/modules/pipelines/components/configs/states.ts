import { atom } from 'jotai';
import type { TPipelineConfig } from '@/pipelines/types';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';

export const configCreateModalAtom = atom(false);
export const ticketConfigPanelDraftsState = atom<
  TPanelFormDrafts<TPipelineConfig>
>({});
