import { createContext, useContext } from 'react';

export const BlockEditorEditableContext = createContext<boolean | undefined>(
  undefined,
);

export const useBlockEditorEditable = (fallback: boolean): boolean =>
  useContext(BlockEditorEditableContext) ?? fallback;
