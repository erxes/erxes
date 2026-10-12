import type { ComposerBlockEditor } from './composer';
import type { IResponseTemplate } from '@/responseTemplate/types';

export type ResponseTemplateSuggestion = IResponseTemplate & {
  preview: string;
};
export type ResponseTemplateSuggestionsOptions = {
  editor: ComposerBlockEditor;
  enabled: boolean;
};
