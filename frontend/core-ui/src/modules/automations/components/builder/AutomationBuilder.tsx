import { ReactFlowProvider } from '@xyflow/react';
import { useEffect } from 'react';

import '@xyflow/react/dist/style.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { Tabs, useMultiQueryState } from 'erxes-ui';
import { AutomationBuilderDnDProvider } from '../../context/AutomationBuilderDnDProvider';
import { AutomationBuilderHeader } from './AutomationBuilderHeader';
import { AutomationBuilderSidebar } from './sidebar/components/AutomationBuilderSidebar';

import { InspectorPanel } from '@/automations/components/builder/InspectorPanel';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import {
  automationBuilderActiveTabState,
  automationBuilderSiderbarOpenState,
} from '@/automations/states/automationState';
import {
  automationBuilderFormSchema,
  TAutomationBuilderForm,
} from '@/automations/utils/AutomationFormDefinitions';
import { useAtom } from 'jotai';
import { AutomationBuilderTabsType, IAutomation } from '../../types';
import { deepCleanNulls } from '../../utils/automationBuilderUtils';
import { AutomationHistories } from './history/components/AutomationHistories';

type AutomationBuilderProps = {
  detail?: IAutomation;
};

export const AutomationBuilder = ({ detail }: AutomationBuilderProps) => {
  const [activeTab, setActiveTab] = useAtom(automationBuilderActiveTabState);
  const [isOpenSideBar, setOpenSidebar] = useAtom(
    automationBuilderSiderbarOpenState,
  );
  const [queryParams] = useMultiQueryState<{
    activeNodeId: string;
    activeTab: AutomationBuilderTabsType;
  }>(['activeNodeId', 'activeTab']);

  const form = useForm<TAutomationBuilderForm>({
    resolver: zodResolver(automationBuilderFormSchema),
    defaultValues: deepCleanNulls(detail),
  });

  useEffect(() => {
    if (activeTab !== queryParams.activeTab) {
      setActiveTab(queryParams.activeTab || AutomationBuilderTabsType.Builder);
    }

    if (queryParams.activeNodeId && !isOpenSideBar) {
      setOpenSidebar(true);
    }
  }, [queryParams?.activeTab, queryParams?.activeNodeId]);

  return (
    <AutomationProvider>
      <ReactFlowProvider>
        <AutomationBuilderDnDProvider>
          <FormProvider {...form}>
            <Tabs value={activeTab} className="h-screen flex flex-col">
              <AutomationBuilderHeader />
              {activeTab === 'builder' && (
                <Tabs.Content
                  value="builder"
                  className="flex-1 h-full relative"
                >
                  {/* <AutomationBuilderCanvas /> */}
                  <InspectorPanel />
                  <AutomationBuilderSidebar />
                </Tabs.Content>
              )}
              {activeTab === 'history' && (
                <Tabs.Content
                  value="history"
                  className="flex-1 flex flex-col h-full"
                >
                  <AutomationHistories />
                </Tabs.Content>
              )}
            </Tabs>
          </FormProvider>
        </AutomationBuilderDnDProvider>
      </ReactFlowProvider>
    </AutomationProvider>
  );
};
