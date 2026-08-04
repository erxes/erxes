import { ApolloError } from '@apollo/client';
import { createContext, useContext, type ReactNode } from 'react';

interface ImportHistoriesRecordTableContextValue {
  contentTypes: any[];
  loading?: boolean;
  totalCount: number;
  typesError?: ApolloError;
  typesLoading?: boolean;
  columnsLength?: number;
}

const ImportHistoriesRecordTableProviderContext = createContext<
  ImportHistoriesRecordTableContextValue | undefined
>(undefined);

interface ImportHistoriesRecordTableProviderProps {
  children: ReactNode;
  value: ImportHistoriesRecordTableContextValue;
}

export function ImportHistoriesRecordTableProvider({
  children,
  value,
}: ImportHistoriesRecordTableProviderProps) {
  return (
    <ImportHistoriesRecordTableProviderContext.Provider value={value}>
      {children}
    </ImportHistoriesRecordTableProviderContext.Provider>
  );
}

export function useImportHistoriesRecordTable() {
  const context = useContext(ImportHistoriesRecordTableProviderContext);
  if (!context) {
    throw new Error(
      'useImportHistoriesRecordTable must be used within ImportHistoriesRecordTableProvider',
    );
  }
  return context;
}
