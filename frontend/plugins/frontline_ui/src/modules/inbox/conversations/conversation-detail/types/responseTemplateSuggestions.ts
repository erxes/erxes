import type { ComposerBlockEditor } from '@/inbox/conversations/conversation-detail/types/composer';
import type { toResponseTemplateText } from '@/responseTemplate/utils/toResponseTemplateText';

export type ResponseTemplateSuggestion = ReturnType<
  typeof toResponseTemplateText
> & {
  preview: string;
};
export type ResponseTemplateSuggestionsOptions = {
  editor: ComposerBlockEditor;
  enabled: boolean;
};
