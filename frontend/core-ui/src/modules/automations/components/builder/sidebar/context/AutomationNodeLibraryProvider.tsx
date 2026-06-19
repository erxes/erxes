import { createContext, useContext } from 'react';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { AutomationErrorState } from '@/automations/components/common/AutomationErrorState';
import { SidebarNodeLibrarySkeleton } from '@/automations/components/builder/sidebar/components/library/SidebarNodeLibrarySkeleton';

type AutomationNodeLibraryProviderContextType = Pick<
  ReturnType<typeof useAutomationNodeLibrarySidebar>,
  'loading' | 'error' | 'refetch' | 'onDragStart' | 'onSelectNode'
>;

const AutomationNodeLibraryProviderContext =
  createContext<AutomationNodeLibraryProviderContextType | null>(null);

export const AutomationNodeLibraryProvider = ({
  children,
  loading,
  error,
  refetch,
  onDragStart,
  onSelectNode,
}: {
  children: React.ReactNode;
} & AutomationNodeLibraryProviderContextType) => {
  if (loading) {
    return <SidebarNodeLibrarySkeleton />;
  }

  if (error) {
    return (
      <AutomationErrorState
        errorCode={error.message}
        errorDetails={error.stack}
        onRetry={refetch}
      />
    );
  }

  return (
    <AutomationNodeLibraryProviderContext.Provider
      value={{ loading, error, refetch, onDragStart, onSelectNode }}
    >
      {children}
    </AutomationNodeLibraryProviderContext.Provider>
  );
};

export const useAutomationNodeLibraryProvider = () => {
  const ctx = useContext(AutomationNodeLibraryProviderContext);

  if (!ctx) {
    throw new Error(
      'useAutomationNodeLibraryProvider must be used within AutomationNodeLibraryProvider',
    );
  }

  return ctx;
};
