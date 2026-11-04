import { atom } from 'jotai';
import type {
  TCreatePipelineForm,
  TUpdatePipelineForm,
} from '@/pipelines/types';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';

export const pipelineCreatePanelDraftsState = atom<
  TPanelFormDrafts<TCreatePipelineForm>
>({});
export const pipelinePanelDraftsState = atom<
  TPanelFormDrafts<TUpdatePipelineForm>
>({});
