import { ApolloError } from '@apollo/client';
import { createContext, useContext, type ReactNode } from 'react';

interface ExportHistoriesRecordTableContextValue {
  contentTypes: any[];
  loading?: boolean;
  totalCount: number;
  typesError?: ApolloError;
  typesLoading?: boolean;
  columnsLength?: number;
}

const ExportHistoriesRecordTableProviderContext = createContext<
  ExportHistoriesRecordTableContextValue | undefined
>(undefined);

interface ExportHistoriesRecordTableProviderProps {
  children: ReactNode;
  value: ExportHistoriesRecordTableContextValue;
}

export function ExportHistoriesRecordTableProvider({
  children,
  value,
}: ExportHistoriesRecordTableProviderProps) {
  return (
    <ExportHistoriesRecordTableProviderContext.Provider value={value}>
      {children}
    </ExportHistoriesRecordTableProviderContext.Provider>
  );
}

export function useExportHistoriesRecordTable() {
  const context = useContext(ExportHistoriesRecordTableProviderContext);

  if (!context) {
    throw new Error(
      'useExportHistoriesRecordTable must be used within ExportHistoriesRecordTableProvider',
    );
  }

  return context;
}
