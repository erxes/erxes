import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { AUTOMATION_LIBRARY_TABS } from '@/automations/constants';
import { automationBuilderActiveTabState } from '@/automations/states/automationState';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Button, cn, Toggle } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { SubmitErrorHandler } from 'react-hook-form';
import { AutomationBuilderStatusSwitch } from './AutomationBuilderStatusSwitch';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';

type AutomationBuilderHeaderActionsProps = {
  loading?: boolean;
  onSave: (values: TAutomationBuilderForm) => Promise<unknown>;
  onError: SubmitErrorHandler<TAutomationBuilderForm>;
};

export const AutomationBuilderHeaderActions = ({
  loading,
  onSave,
  onError,
}: AutomationBuilderHeaderActionsProps) => {
  const { isEmpty } = useAutomationNodes();
  const activeTab = useAtomValue(automationBuilderActiveTabState);
  const { activeNodeTab, queryParams } = useAutomationNodeLibrarySidebar();

  const { handleNodeLibraryToggle } = useAutomationBuilderSidebarHooks();
  if (activeTab !== 'builder') {
    return null;
  }

  const isEmptyFlow =
    isEmpty(AutomationNodeType.Trigger) && isEmpty(AutomationNodeType.Action);

  return (
    <div className="flex shrink-0 items-center gap-4 lg:gap-9">
      <div className="flex shrink-0 flex-row items-center justify-between gap-4">
        <AutomationBuilderStatusSwitch
          disabled={loading}
          onSave={onSave}
          onError={onError}
        />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {AUTOMATION_LIBRARY_TABS.map(({ value, label, icon: Icon }) => (
          <Toggle
            key={value}
            variant="outline"
            className={cn(
              'data-[state=on]:shadow-focus data-[state=on]:bg-background bg-background text-foreground',
            )}
            pressed={
              Boolean(queryParams?.activeNodeTab) && value === activeNodeTab
            }
            asChild
            disabled={value === AutomationNodeType.Action && isEmptyFlow}
            onPressedChange={() => handleNodeLibraryToggle(value)}
          >
            <Button variant="outline" className="whitespace-nowrap">
              <Icon className="shrink-0" />
              <span>{label}</span>
            </Button>
          </Toggle>
        ))}
      </div>
    </div>
  );
};
