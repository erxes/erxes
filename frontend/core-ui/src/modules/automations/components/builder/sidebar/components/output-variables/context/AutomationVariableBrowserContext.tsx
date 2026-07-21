import { createContext, useContext } from 'react';
import { TAutomationVariableBrowserProps } from '../AutomationVariableBrowserTypes';
import { useAutomationVariableBrowser } from '../hooks/useAutomationVariableBrowser';

type TAutomationVariableBrowserContext = ReturnType<
  typeof useAutomationVariableBrowser
> & {
  className?: string;
  emptyState?: TAutomationVariableBrowserProps['emptyState'];
  onInsertVariable?: TAutomationVariableBrowserProps['onInsertVariable'];
  sourceNodes: NonNullable<TAutomationVariableBrowserProps['sourceNodes']>;
  sourceSectionTitle: string;
};

const AutomationVariableBrowserContext =
  createContext<TAutomationVariableBrowserContext | null>(null);

export const AutomationVariableBrowserProvider = ({
  children,
  className,
  emptyState,
  onInsertVariable,
  sourceNode,
  sourceNodes,
  sourceSectionTitle = 'Selected Node',
}: TAutomationVariableBrowserProps & { children: React.ReactNode }) => {
  const browser = useAutomationVariableBrowser({ sourceNode, sourceNodes });

  return (
    <AutomationVariableBrowserContext.Provider
      value={{
        ...browser,
        className,
        emptyState,
        onInsertVariable,
        sourceNodes: sourceNodes ?? [],
        sourceSectionTitle,
      }}
    >
      {children}
    </AutomationVariableBrowserContext.Provider>
  );
};

export const useAutomationVariableBrowserContext = () => {
  const context = useContext(AutomationVariableBrowserContext);

  if (!context) {
    throw new Error(
      'useAutomationVariableBrowserContext must be used within an AutomationVariableBrowserProvider',
    );
  }

  return context;
};
