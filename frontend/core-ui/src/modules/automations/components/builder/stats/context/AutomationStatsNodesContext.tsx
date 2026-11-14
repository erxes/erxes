import { createContext, ReactNode, useContext } from 'react';

type TAutomationStatsNode = { id: string; type: string; label?: string };

type TAutomationStatsNodes = {
  actions: TAutomationStatsNode[];
  workflows: { actions?: TAutomationStatsNode[] }[];
};

// The builder fills this from its form, a dashboard widget from the saved
// automation, so stats sections name nodes the same way in both places.
const AutomationStatsNodesContext = createContext<TAutomationStatsNodes>({
  actions: [],
  workflows: [],
});

export const AutomationStatsNodesProvider = ({
  actions,
  workflows,
  children,
}: Partial<TAutomationStatsNodes> & { children: ReactNode }) => (
  <AutomationStatsNodesContext.Provider
    value={{ actions: actions || [], workflows: workflows || [] }}
  >
    {children}
  </AutomationStatsNodesContext.Provider>
);

export const useAutomationStatsNodes = () =>
  useContext(AutomationStatsNodesContext);
