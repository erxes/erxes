import { cn } from 'erxes-ui';
import { AutomationVariableBrowserCustomProperties } from './components/AutomationVariableBrowserCustomProperties';
import { AutomationVariableBrowserHeader } from './components/AutomationVariableBrowserHeader';
import { AutomationVariableBrowserInfoState } from './components/AutomationVariableBrowserInfoState';
import { AutomationVariableBrowserOutputVariables } from './components/AutomationVariableBrowserOutputVariables';
import {
  AutomationVariableBrowserProvider,
  useAutomationVariableBrowserContext,
} from './context/AutomationVariableBrowserContext';
import { TAutomationVariableBrowserProps } from './AutomationVariableBrowserTypes';

export type { TAutomationVariableSourceNode } from './AutomationVariableBrowserTypes';

const AutomationVariableBrowserContent = () => {
  const { activeSourceNode, className, emptyState } =
    useAutomationVariableBrowserContext();

  if (!activeSourceNode) {
    if (!emptyState) {
      return null;
    }

    return (
      <div className={cn('space-y-3 px-3 py-2 text-sm', className)}>
        <AutomationVariableBrowserInfoState {...emptyState} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-3 px-5 py-2 text-sm', className)}>
      <AutomationVariableBrowserHeader />
      <AutomationVariableBrowserOutputVariables />
      <AutomationVariableBrowserCustomProperties />
    </div>
  );
};

export const AutomationVariableBrowser = (
  props: TAutomationVariableBrowserProps,
) => {
  return (
    <AutomationVariableBrowserProvider {...props}>
      <AutomationVariableBrowserContent />
    </AutomationVariableBrowserProvider>
  );
};
