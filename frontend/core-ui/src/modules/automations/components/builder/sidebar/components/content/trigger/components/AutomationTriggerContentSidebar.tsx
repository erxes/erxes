import { CustomTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/CustomTriggerContent';
import { DefaultTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/DefaultTriggerContent';
import { isSegmentMembershipTrigger } from '@/automations/utils/automationBuilderUtils/triggerFolks';
import { AutomationTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { Separator } from 'erxes-ui';
import React from 'react';
import { useNodeFormKey } from '@/automations/components/builder/sidebar/hooks/useNodeFormKey';
import { AutomationDefaultTriggerHeader } from './AutomationDefaultTriggerHeader';
import { AutomationTriggerEveryTime } from './AutomationTriggerEveryTime';
import { SegmentMembershipTriggerContent } from './SegmentMembershipTriggerContent';

export const AutomationTriggerContentSidebar =
  React.memo<AutomationTriggerContentProps>(({ activeNode }) => {
    const containerClasses = 'h-full flex flex-col';
    const formKey = useNodeFormKey(activeNode?.id);

    if (isSegmentMembershipTrigger(activeNode?.config)) {
      return (
        <div className={containerClasses}>
          <SegmentMembershipTriggerContent
            key={formKey}
            activeNode={activeNode}
          />
        </div>
      );
    }

    if (activeNode?.isCustom) {
      return (
        <div className={containerClasses}>
          <AutomationTriggerEveryTime activeNode={activeNode} />
          <CustomTriggerContent key={formKey} activeNode={activeNode} />
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <AutomationDefaultTriggerHeader activeNode={activeNode} />
        <Separator />
        <div className="flex-1 w-auto overflow-auto">
          <DefaultTriggerContent key={formKey} activeNode={activeNode} />
        </div>
      </div>
    );
  });
