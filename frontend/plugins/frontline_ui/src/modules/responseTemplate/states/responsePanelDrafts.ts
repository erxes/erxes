import { atom } from 'jotai';
import type { TResponseForm } from '@/responseTemplate/types';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';

export const responsePanelDraftsState = atom<TPanelFormDrafts<TResponseForm>>(
  {},
);
