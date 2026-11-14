import { atom } from 'jotai';
import type {
  TCreatePipelineForm,
  TUpdatePipelineForm,
} from '@/pipelines/types';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';
import type { IMailPipelineSettings } from '@/integrations/mail/hooks/useMailPipelineIntegration';

export const pipelineCreatePanelDraftsState = atom<
  TPanelFormDrafts<TCreatePipelineForm>
>({});
export const pipelinePanelDraftsState = atom<
  TPanelFormDrafts<TUpdatePipelineForm>
>({});
export const pipelineMailPanelDraftsState = atom<
  TPanelFormDrafts<IMailPipelineSettings>
>({});
