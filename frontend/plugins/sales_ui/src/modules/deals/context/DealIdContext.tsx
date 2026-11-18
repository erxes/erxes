import { createContext, useContext } from 'react';

const DealIdContext = createContext<string | null>(null);

export const DealIdProvider = DealIdContext.Provider;

export const useDealIdOverride = () => useContext(DealIdContext);
