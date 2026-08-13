import { createContext, useContext } from 'react';
import type { CallFilters } from '../types';

export const CallFiltersContext = createContext<CallFilters | null>(null);

export function useCallFilters(): CallFilters {
  const ctx = useContext(CallFiltersContext);
  if (!ctx) {
    throw new Error(
      'useCallFilters must be used within CallFiltersContext.Provider',
    );
  }
  return ctx;
}
