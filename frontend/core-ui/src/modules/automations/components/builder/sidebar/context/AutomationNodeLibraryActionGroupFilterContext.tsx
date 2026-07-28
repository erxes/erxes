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
  activeTriggerGroup: string | null;
  setActiveTriggerGroup: Dispatch<SetStateAction<string | null>>;
}

const automationNodeLibraryActiveActionGroupState = atomWithStorage<
  string | null
>('automationNodeLibraryActiveActionGroup', null);

const automationNodeLibraryActiveTriggerGroupState = atomWithStorage<
  string | null
>('automationNodeLibraryActiveTriggerGroup', null);

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
  const [activeTriggerGroup, setActiveTriggerGroup] = useAtom(
    automationNodeLibraryActiveTriggerGroupState,
  );

  return (
    <AutomationNodeLibraryActionGroupFilterContext.Provider
      value={{
        activeActionGroup,
        setActiveActionGroup,
        activeTriggerGroup,
        setActiveTriggerGroup,
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
