import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { AUTOMATION_LIBRARY_TABS } from '@/automations/constants';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useWorkflowEditScope } from '@/automations/context/WorkflowEditScopeProvider';
import { AutomationNodeType } from '@/automations/types';
import { cn } from 'erxes-ui';
import { motion } from 'motion/react';

export const AutomationNodeLibraryTabs = ({
  activeNodeTab,
}: {
  activeNodeTab: AutomationNodeType;
}) => {
  const { awaitingToConnectNodeId } = useAutomation();
  const workflowEditScope = useWorkflowEditScope();
  const { openNodeLibrary } = useAutomationBuilderSidebarHooks();

  if (awaitingToConnectNodeId || workflowEditScope) {
    return null;
  }

  return (
    <div className="shrink-0 px-5 pt-4">
      <div className="relative flex h-7 items-center rounded-md bg-foreground/5">
        {AUTOMATION_LIBRARY_TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => openNodeLibrary(value)}
            className={cn(
              'relative flex h-7 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm text-muted-foreground transition-colors',
              activeNodeTab === value && 'text-foreground',
            )}
          >
            {activeNodeTab === value && (
              <motion.div
                layoutId="activeNodeLibraryTab"
                className="absolute inset-0 rounded-md bg-background shadow-sm"
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
            )}
            <Icon className="relative z-10 size-3.5 shrink-0" />
            <span className="relative z-10 whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
