import type { ComposeValues } from '@/integrations/mail/composer/types/directMailComposer';
import type { RecipientSuggestions } from '@/integrations/mail/composer/types/directMailRecipientSuggestions';
import type {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  MutableRefObject,
  RefObject,
  SetStateAction,
} from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

export type RecipientFieldName = 'to' | 'cc' | 'bcc';

export type DirectMailRecipientControl = ControllerRenderProps<
  ComposeValues,
  RecipientFieldName
>;

export interface DirectMailRecipientFieldState extends RecipientSuggestions {
  fieldName: RecipientFieldName;
  focused: boolean;
  setFocused: Dispatch<SetStateAction<boolean>>;
  draft: string;
  selected: string[];
  activeEmail: string;
  setActiveEmail: Dispatch<SetStateAction<string>>;
  listId: string;
  inputRef: RefObject<HTMLInputElement>;
  closeSuggestions: () => void;
  selectEmail: (email: string, customerId?: string) => void;
  commitDraft: (focusInput?: boolean) => void;
  activeOptionIndex: number;
  removeEmail: (email: string) => void;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export interface DirectMailRecipientStore
  extends Pick<
    DirectMailRecipientFieldState,
    | 'focused'
    | 'setFocused'
    | 'draft'
    | 'selected'
    | 'activeEmail'
    | 'setActiveEmail'
    | 'listId'
    | 'inputRef'
  > {
  suggestionsEnabled: boolean;
  setSuggestionsEnabled: Dispatch<SetStateAction<boolean>>;
  setDraft: Dispatch<SetStateAction<string>>;
  setSelected: Dispatch<SetStateAction<string[]>>;
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  lastEmitted: MutableRefObject<string | undefined>;
  searchReady: boolean;
}
