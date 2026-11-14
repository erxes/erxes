import type { DefaultReactSuggestionItem } from '@blocknote/react';
import type { BLOCK_SCHEMA } from 'erxes-ui/modules/blocks/constant/blockEditorSchema';

export interface BlockEditorProps {
  editor: IBlockEditor;
  onFocus?: () => void;
  onBlur?: () => void;
  onPaste?: (event: ClipboardEvent) => void;
  onChange?: () => void;
  additionalSlashMenuItems?:
    | DefaultReactSuggestionItem[]
    | ((editor: IBlockEditor) => DefaultReactSuggestionItem[]);
  readonly?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  sideMenu?: boolean;
  formattingToolbar?: boolean;
  linkToolbar?: boolean;
  slashMenuOnTop?: boolean;
}

export interface IEditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  scope?: string;
  isHTML?: boolean;
  /** What screen readers call the editor. */
  label?: string;
  uploadFile?: (file: File) => Promise<string>;
}

export type IBlockEditor = typeof BLOCK_SCHEMA.BlockNoteEditor;
