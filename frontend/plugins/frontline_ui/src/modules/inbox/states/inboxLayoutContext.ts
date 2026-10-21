import { createContext } from 'react';
export const InboxLayoutContext = createContext<'list' | 'split' | null>(null);
