import { CustomTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/CustomTriggerContent';
import { DefaultTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/DefaultTriggerContent';
import { isSegmentMembershipTrigger } from '@/automations/utils/automationBuilderUtils/triggerFolks';
import { AutomationTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { Separator } from 'erxes-ui';
import React from 'react';
import { AutomationDefaultTriggerHeader } from './AutomationDefaultTriggerHeader';
import { AutomationTriggerEveryTime } from './AutomationTriggerEveryTime';
import { SegmentMembershipTriggerContent } from './SegmentMembershipTriggerContent';

export const AutomationTriggerContentSidebar =
  React.memo<AutomationTriggerContentProps>(({ activeNode }) => {
    const containerClasses = 'h-full flex flex-col';

    if (isSegmentMembershipTrigger(activeNode?.config)) {
      return (
        <div className={containerClasses}>
          <SegmentMembershipTriggerContent
            key={activeNode?.id}
            activeNode={activeNode}
          />
        </div>
      );
    }

    if (activeNode?.isCustom) {
      return (
        <div className={containerClasses}>
          <AutomationTriggerEveryTime activeNode={activeNode} />
          <CustomTriggerContent key={activeNode?.id} activeNode={activeNode} />
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <AutomationDefaultTriggerHeader activeNode={activeNode} />
        <Separator />
        <div className="flex-1 w-auto overflow-auto">
          <DefaultTriggerContent key={activeNode?.id} activeNode={activeNode} />
        </div>
      </div>
    );
  });
