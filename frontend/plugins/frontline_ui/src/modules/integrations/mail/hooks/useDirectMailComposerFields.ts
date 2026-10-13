import { createContext, useContext } from 'react';

interface DirectMailComposerFieldsState {
  showCc: boolean;
  showBcc: boolean;
  openCc: () => void;
  openBcc: () => void;
  emails: string[];
  targetCustomerId?: string;
}

export const DirectMailComposerFieldsContext =
  createContext<DirectMailComposerFieldsState | null>(null);

export const useDirectMailComposerFields = () => {
  const state = useContext(DirectMailComposerFieldsContext);
  if (!state) {
    throw new Error(
      'Direct mail fields must be used within DirectMailComposer',
    );
  }
  return state;
};
