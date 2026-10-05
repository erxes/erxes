import { useAutomationNodeIssues } from '@/automations/hooks/useAutomationNodeIssues';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Tooltip } from 'erxes-ui';

/** What a node still needs before the automation can be activated. */
export const NodeWarningIndicator = ({ nodeId }: { nodeId: string }) => {
  const { issuesOf } = useAutomationNodeIssues();
  const issues = issuesOf(nodeId);

  if (!issues.length) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span className="flex items-center text-warning">
            <IconAlertTriangle className="size-4" />
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <ul className="list-disc space-y-0.5 pl-4 text-xs">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
