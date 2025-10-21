import React, { useMemo } from 'react';
import { AutomationTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { DefaultTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/DefaultTriggerContent';
import { CustomTriggerContent } from '@/automations/components/builder/sidebar/components/content/trigger/components/CustomTriggerContent';

/**
 * Main automation trigger content sidebar component
 *
 * Renders the appropriate trigger configuration interface based on the active node type.
 * Supports both default triggers and custom plugin-based triggers with proper error handling
 * and accessibility features.
 */
export const AutomationTriggerContentSidebar =
  React.memo<AutomationTriggerContentProps>(({ activeNode }) => {
    const containerClasses = useMemo(() => 'w-[650px] h-full', []);

    if (activeNode?.isCustom) {
      return (
        <div className={containerClasses}>
          <CustomTriggerContent activeNode={activeNode} />
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <DefaultTriggerContent activeNode={activeNode} />
      </div>
    );
  });
