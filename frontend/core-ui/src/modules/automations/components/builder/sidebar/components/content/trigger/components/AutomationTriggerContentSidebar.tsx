import { CustomTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/CustomTriggerContent';
import { DefaultTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/DefaultTriggerContent';
import { AutomationTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { Separator } from 'erxes-ui';
import React from 'react';
import { AutomationDefaultTriggerHeader } from './AutomationDefaultTriggerHeader';

export const AutomationTriggerContentSidebar =
  React.memo<AutomationTriggerContentProps>(({ activeNode }) => {
    const containerClasses = 'h-full flex flex-col';

    if (activeNode?.isCustom) {
      return (
        <div className={containerClasses}>
          <CustomTriggerContent activeNode={activeNode} />
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <AutomationDefaultTriggerHeader activeNode={activeNode} />
        <Separator />
        <div className="flex-1 w-auto overflow-auto px-4">
          <DefaultTriggerContent activeNode={activeNode} />
        </div>
      </div>
    );
  });
