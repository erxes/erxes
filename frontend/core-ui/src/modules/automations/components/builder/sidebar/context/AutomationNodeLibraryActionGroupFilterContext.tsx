import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from 'react';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

interface AutomationNodeLibraryActionGroupFilterContextType {
  activeActionGroup: string | null;
  setActiveActionGroup: Dispatch<SetStateAction<string | null>>;
}

const automationNodeLibraryActiveActionGroupState = atomWithStorage<
  string | null
>('automationNodeLibraryActiveActionGroup', null);

const AutomationNodeLibraryActionGroupFilterContext =
  createContext<AutomationNodeLibraryActionGroupFilterContextType | null>(null);

export const AutomationNodeLibraryActionGroupFilterProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [activeActionGroup, setActiveActionGroup] = useAtom(
    automationNodeLibraryActiveActionGroupState,
  );

  return (
    <AutomationNodeLibraryActionGroupFilterContext.Provider
      value={{
        activeActionGroup,
        setActiveActionGroup,
      }}
    >
      {children}
    </AutomationNodeLibraryActionGroupFilterContext.Provider>
  );
};

export const useAutomationNodeLibraryActionGroupFilter = () => {
  const ctx = useContext(AutomationNodeLibraryActionGroupFilterContext);

  if (!ctx) {
    throw new Error(
      'useAutomationNodeLibraryActionGroupFilter must be used within AutomationNodeLibraryActionGroupFilterProvider',
    );
  }

  return ctx;
};
