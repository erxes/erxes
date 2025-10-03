import { createContext, useContext } from 'react';

export type ISelectDocumentContext = {
  documentIds: string[];
  documents: any[];
  contentType?: string;
  setDocuments: (documents: any[]) => void;
  onSelect: (document: any) => void;
  loading: boolean;
  error: string | null;
};

export const SelectDocumentContext =
  createContext<ISelectDocumentContext | null>(null);

export const useSelectDocumentContext = () => {
  const context = useContext(SelectDocumentContext);
  if (!context) {
    throw new Error(
      'useSelectDocumentContext must be used within a SelectDocumentProvider',
    );
  }
  return context;
};
