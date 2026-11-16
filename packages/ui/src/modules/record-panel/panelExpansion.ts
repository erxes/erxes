import { createContext, useContext } from 'react';

/** Whether the nearest record panel fills a page, and how to switch it. */
type PanelExpansion = {
  expanded: boolean;
  // Missing when the panel cannot expand: its header draws no expand button.
  toggle?: () => void;
} | null;

/** Provided by the host's record panel; erxes-ui's panel parts read it. */
export const PanelExpansionContext = createContext<PanelExpansion>(null);

/** Whether the record shows at full size on its own page. A slot can lay out wider then. */
export const usePanelExpanded = () => useContext(PanelExpansionContext)?.expanded ?? false;
