import { createContext, useContext } from 'react';
import type { CallFilters } from '../types';

/**
 * Context that carries the current filter selections and derived date values
 * for the Call Reports page.  Provided by `CallReportsPage` and consumed by
 * every section component without prop-drilling.
 */
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
