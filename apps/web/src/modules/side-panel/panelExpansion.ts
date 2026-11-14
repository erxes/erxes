import { createContext, useContext } from 'react';
import type { PanelExpansionContextValue } from './recordSidePanelTypes';

export const PanelExpansionContext = createContext<PanelExpansionContextValue>(null);

/** Reads the expansion state of the nearest record panel. */
export const usePanelExpanded = () => useContext(PanelExpansionContext)?.expanded ?? false;
