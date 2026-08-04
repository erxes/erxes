import { ReactFlowProvider } from '@xyflow/react';
import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { Tabs, useMultiQueryState } from 'erxes-ui';
import { AutomationBuilderDnDProvider } from '@/automations/context/AutomationBuilderDnDProvider';

import { AutomationBuilderWorkspace } from '@/automations/components/builder/AutomationBuilderWorkspace';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import {
  automationBuilderActiveTabState,
  automationBuilderSiderbarOpenState,
} from '@/automations/states/automationState';
import { AutomationBuilderUnsavedChangesAlert } from '@/automations/components/builder/AutomationBuilderUnsavedChangesAlert';
import { deepCleanNulls } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import {
  automationBuilderFormSchema,
  TAutomationBuilderForm,
} from '@/automations/utils/automationFormDefinitions';
import { normalizeAutomationWorkflows } from '@/automations/utils/workflowInputs';
import { useAtom, useSetAtom } from 'jotai';
import { AutomationBuilderTabsType, IAutomation } from '@/automations/types';
import { AutomationBuilderHeader } from '@/automations/components/builder/header/AutomationBuilderHeader';
import { AutomationHistories } from '@/automations/components/builder/history/components/AutomationHistories';

type AutomationBuilderProps = {
  detail?: IAutomation;
};

export const AutomationBuilder = ({ detail }: AutomationBuilderProps) => {
  const [activeTab, setActiveTab] = useAtom(automationBuilderActiveTabState);
  const setOpenSidebar = useSetAtom(automationBuilderSiderbarOpenState);
  const [queryParams] = useMultiQueryState<{
    activeNodeId: string;
    activeTab: AutomationBuilderTabsType;
  }>(['activeNodeId', 'activeTab']);
  const cleanedDetail = deepCleanNulls(detail);

  // Migrates legacy workflow formats (raw trigger.* refs, memberActionIds
  // reference model) on load; no-op for clean data
  const normalized = normalizeAutomationWorkflows({
    triggers: cleanedDetail?.triggers ?? [],
    actions: cleanedDetail?.actions ?? [],
    workflows: cleanedDetail?.workflows ?? [],
  });

  const form = useForm<TAutomationBuilderForm>({
    resolver: zodResolver(automationBuilderFormSchema),
    defaultValues: {
      ...cleanedDetail,
      edgeType: cleanedDetail?.edgeType ?? 'default',
      flowDirection: cleanedDetail?.flowDirection ?? 'horizontal',
      ...normalized,
    },
  });

  useEffect(() => {
    const nextActiveTab =
      queryParams.activeTab || AutomationBuilderTabsType.Builder;

    if (activeTab !== nextActiveTab) {
      setActiveTab(nextActiveTab);
    }
  }, [
    activeTab,
    queryParams.activeTab,
    setActiveTab,
  ]);

  useEffect(() => {
    if (queryParams.activeNodeId) {
      setOpenSidebar(true);
    }
  }, [queryParams.activeNodeId, setOpenSidebar]);

  return (
    <AutomationProvider detail={detail}>
      <ReactFlowProvider>
        <AutomationBuilderDnDProvider>
          <FormProvider {...form}>
            <AutomationBuilderUnsavedChangesAlert />
            <Tabs value={activeTab} className="h-screen flex flex-col">
              <AutomationBuilderHeader />
              <Tabs.Content
                value="builder"
                className="flex-1 h-full relative animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
              >
                <AutomationBuilderWorkspace />
              </Tabs.Content>
              <Tabs.Content
                value="history"
                className="flex-1 flex flex-col min-h-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
              >
                <AutomationHistories />
              </Tabs.Content>
            </Tabs>
          </FormProvider>
        </AutomationBuilderDnDProvider>
      </ReactFlowProvider>
    </AutomationProvider>
  );
};
