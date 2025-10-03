import { createContext, useContext } from 'react';

export interface IDocumentsInlineContext {
  documents: any[];
  loading: boolean;
  documentIds?: string[];
  placeholder: string;
  updateDocuments?: (documents: any[]) => void;
}

export const DocumentsInlineContext =
  createContext<IDocumentsInlineContext | null>(null);

export const useDocumentsInlineContext = () => {
  const context = useContext(DocumentsInlineContext);
  if (!context) {
    throw new Error(
      'useDocumentsInlineContext must be used within a DocumentsInlineProvider',
    );
  }
  return context;
};
