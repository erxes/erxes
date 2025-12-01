import React, { useMemo } from 'react';
import {
  isCoreAutomationTriggerType,
  TAutomationTriggerComponent,
} from '@/automations/components/builder/nodes/triggers/coreAutomationTriggers';
import { useCustomTriggerContent } from '@/automations/components/builder/sidebar/hooks/useCustomTriggerContent';
import { AutomationTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { CustomCoreTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/CustomCoreTriggerContent';
import { CustomRemoteTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/CustomRemoteTriggerContent';

/**
 * Custom trigger content router component
 */
export const CustomTriggerContent = React.memo<AutomationTriggerContentProps>(
  ({ activeNode }) => {
    const { moduleName } = useCustomTriggerContent(activeNode);

    const isCoreTrigger = useMemo(
      () =>
        isCoreAutomationTriggerType(
          moduleName as any,
          TAutomationTriggerComponent.Sidebar,
        ),
      [moduleName],
    );

    if (isCoreTrigger) {
      return (
        <CustomCoreTriggerContent
          moduleName={moduleName}
          activeNode={activeNode}
        />
      );
    }

    return <CustomRemoteTriggerContent activeNode={activeNode} />;
  },
);
