import { createContext, useContext } from 'react';

export const CPUserPanelIdContext = createContext<string | null>(null);
export const useCPUserPanelId = () => useContext(CPUserPanelIdContext);
