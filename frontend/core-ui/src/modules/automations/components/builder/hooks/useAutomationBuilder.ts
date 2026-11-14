import { TAutomationSeed } from '@/automations/hooks/useAutomationSeed';
import {
  automationBuilderActiveTabState,
  automationBuilderSiderbarOpenState,
} from '@/automations/states/automationState';
import { AutomationBuilderTabsType, IAutomation } from '@/automations/types';
import { deepCleanNulls } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import {
  automationBuilderFormSchema,
  TAutomationBuilderForm,
} from '@/automations/utils/automationFormDefinitions';
import { normalizeAutomationWorkflows } from '@/automations/utils/workflowInputs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMultiQueryState } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

/**
 * The builder form, seeded from the saved automation or, for a fresh one,
 * from another module's seed. Legacy workflow formats are migrated on load,
 * a no-op for clean data.
 */
const defaultValuesOf = (
  detail?: IAutomation,
  seed?: TAutomationSeed,
): TAutomationBuilderForm => {
  const cleaned = deepCleanNulls(detail);

  return {
    ...cleaned,
    edgeType: cleaned?.edgeType ?? 'default',
    flowDirection: cleaned?.flowDirection ?? 'horizontal',
    ...normalizeAutomationWorkflows({
      triggers: cleaned?.triggers ?? [],
      actions: cleaned?.actions ?? [],
      workflows: cleaned?.workflows ?? [],
    }),
    ...(detail ? {} : seed),
  } as TAutomationBuilderForm;
};

/** The builder's form, and its tab and sidebar following the URL. */
export const useAutomationBuilder = (
  detail?: IAutomation,
  seed?: TAutomationSeed,
) => {
  const [activeTab, setActiveTab] = useAtom(automationBuilderActiveTabState);
  const setOpenSidebar = useSetAtom(automationBuilderSiderbarOpenState);
  const [queryParams] = useMultiQueryState<{
    activeNodeId: string;
    activeTab: AutomationBuilderTabsType;
  }>(['activeNodeId', 'activeTab']);
  const form = useForm<TAutomationBuilderForm>({
    resolver: zodResolver(automationBuilderFormSchema),
    defaultValues: defaultValuesOf(detail, seed),
  });

  useEffect(() => {
    const nextActiveTab =
      queryParams.activeTab || AutomationBuilderTabsType.Builder;

    if (activeTab !== nextActiveTab) {
      setActiveTab(nextActiveTab);
    }
  }, [activeTab, queryParams.activeTab, setActiveTab]);

  useEffect(() => {
    if (queryParams.activeNodeId) {
      setOpenSidebar(true);
    }
  }, [queryParams.activeNodeId, setOpenSidebar]);

  return { form, activeTab };
};
