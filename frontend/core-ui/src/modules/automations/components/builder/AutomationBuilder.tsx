import { ReactFlowProvider } from '@xyflow/react';
import { FormProvider } from 'react-hook-form';
import { Tabs } from 'erxes-ui';
import { AutomationBuilderDnDProvider } from '@/automations/context/AutomationBuilderDnDProvider';
import { AutomationBuilderWorkspace } from '@/automations/components/builder/AutomationBuilderWorkspace';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import { AutomationBuilderUnsavedChangesAlert } from '@/automations/components/builder/AutomationBuilderUnsavedChangesAlert';
import { useAutomationBuilder } from '@/automations/components/builder/hooks/useAutomationBuilder';
import { IAutomation } from '@/automations/types';
import { AutomationBuilderHeader } from '@/automations/components/builder/header/AutomationBuilderHeader';
import { TAutomationSeed } from '@/automations/hooks/useAutomationSeed';
import { AutomationHistories } from '@/automations/components/builder/history/components/AutomationHistories';
import { AutomationStats } from '@/automations/components/builder/stats/components/AutomationStats';

type AutomationBuilderProps = {
  detail?: IAutomation;
  // Prefilled nodes for a fresh automation opened from another module; never
  // set alongside a saved detail.
  seed?: TAutomationSeed;
  // Edit page only: reloads the saved automation and remounts this builder.
  refetchDetail?: () => Promise<void>;
};

export const AutomationBuilder = ({
  detail,
  seed,
  refetchDetail,
}: AutomationBuilderProps) => {
  const { form, activeTab } = useAutomationBuilder(detail, seed);

  return (
    <AutomationProvider detail={detail} refetchDetail={refetchDetail}>
      <ReactFlowProvider>
        <AutomationBuilderDnDProvider>
          <FormProvider {...form}>
            <AutomationBuilderUnsavedChangesAlert />
            <Tabs value={activeTab} className="h-full flex flex-col">
              <AutomationBuilderHeader />
              <Tabs.Content
                value="builder"
                className="flex-1 min-h-0 relative animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
              >
                <AutomationBuilderWorkspace />
              </Tabs.Content>
              <Tabs.Content
                value="history"
                className="flex-1 flex flex-col min-h-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
              >
                <AutomationHistories />
              </Tabs.Content>
              <Tabs.Content
                value="stats"
                className="flex-1 flex flex-col min-h-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
              >
                <AutomationStats />
              </Tabs.Content>
            </Tabs>
          </FormProvider>
        </AutomationBuilderDnDProvider>
      </ReactFlowProvider>
    </AutomationProvider>
  );
};
