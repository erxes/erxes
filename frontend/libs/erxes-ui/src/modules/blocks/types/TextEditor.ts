import {
  DefaultReactSuggestionItem,
  SuggestionMenuProps,
} from '@blocknote/react';
import { BLOCK_SCHEMA } from '../constant/blockEditorSchema';

export type SlashMenuProps = SuggestionMenuProps<DefaultReactSuggestionItem>;

export interface BlockEditorProps {
  editor: IBlockEditor;
  onFocus?: () => void;
  onBlur?: () => void;
  onPaste?: (event: ClipboardEvent) => void;
  onChange?: () => void;
  readonly?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  sideMenu?: boolean;
  selectMedia?: (options?: {
    fileType?: string;
    multiple?: boolean;
  }) => Promise<
    | {
        url: string;
        name?: string;
        fileType?: string;
        mimeType?: string;
      }
    | {
        url: string;
        name?: string;
        fileType?: string;
        mimeType?: string;
      }[]
    | null
  >;
}

export interface IEditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  scope?: string;
  isHTML?: boolean;
  uploadFile?: (file: File) => Promise<string>;
  selectMedia?: BlockEditorProps['selectMedia'];
}

export type IBlockEditor = typeof BLOCK_SCHEMA.BlockNoteEditor;
