/**
 * @maily-to/core publishes "./blocks" and "./extensions" as package.json
 * subpath exports, but this repo's tsconfig uses classic "node" module
 * resolution, which does not consult the exports map (only "bundler" /
 * "node16"+ do). Rspack resolves these subpaths correctly at build/runtime;
 * these ambient declarations only fill the gap for the TypeScript checker.
 */
declare module '@maily-to/core/blocks' {
  import type { Editor, Range } from '@tiptap/core';

  interface CommandProps {
    editor: Editor;
    range: Range;
  }

  export type BlockItem = {
    title: string;
    description?: string;
    searchTerms: string[];
    icon?: JSX.Element;
    render?: (editor: Editor) => JSX.Element | null | true;
    preview?: string | ((editor: Editor) => JSX.Element | null);
  } & (
    | { command: (options: CommandProps) => void; id?: never; commands?: never }
    | { id: string; command?: never; commands: BlockItem[] }
  );

  export type BlockGroupItem = {
    title: string;
    commands: BlockItem[];
  };

  export const text: BlockItem;
  export const heading1: BlockItem;
  export const heading2: BlockItem;
  export const heading3: BlockItem;
  export const bulletList: BlockItem;
  export const orderedList: BlockItem;
  export const blockquote: BlockItem;
  export const divider: BlockItem;
  export const hardBreak: BlockItem;
  export const clearLine: BlockItem;
  export const button: BlockItem;
  export const image: BlockItem;
  export const inlineImage: BlockItem;
  export const logo: BlockItem;
  export const columns: BlockItem;
  export const section: BlockItem;
  export const repeat: BlockItem;
  export const spacer: BlockItem;
  export const footer: BlockItem;
  export const linkCard: BlockItem;
  export const htmlCodeBlock: BlockItem;
}

declare module '@maily-to/core/extensions' {
  import type { AnyExtension, Editor } from '@tiptap/core';
  import type { SuggestionOptions } from '@tiptap/suggestion';

  export const MailyKit: AnyExtension;
  export const HTMLCodeBlockExtension: AnyExtension;
  export const PlaceholderExtension: AnyExtension;

  export interface MailyVariable {
    name: string;
    required?: boolean;
    valid?: boolean;
    hideDefaultValue?: boolean;
    label?: string;
  }

  export type MailyVariablesFunction = (opts: {
    query: string;
    from: 'content-variable' | 'bubble-variable' | 'repeat-variable';
    editor: Editor;
  }) => MailyVariable[];

  export type MailyVariables = MailyVariable[] | MailyVariablesFunction;

  export const VariableExtension: AnyExtension & {
    configure: (options: {
      suggestion: Omit<SuggestionOptions, 'editor'>;
      variables: MailyVariables;
    }) => AnyExtension;
  };

  export const ImageUploadExtension: AnyExtension & {
    configure: (options: {
      onImageUpload?: (file: Blob) => Promise<string>;
      allowedMimeTypes?: string[];
    }) => AnyExtension;
  };

  export function getVariableSuggestions(
    char?: string,
  ): Omit<SuggestionOptions, 'editor'>;
}
