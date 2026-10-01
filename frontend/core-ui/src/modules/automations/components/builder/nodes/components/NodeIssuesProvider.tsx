import { useNodeIssuesReporter } from '@/automations/hooks/useAutomationNodeIssues';
import { ReactNode } from 'react';
import { AutomationNodeIssuesContext } from 'ui-modules';

/** Lets a node's content, core or plugin, report what it still needs. */
export const NodeIssuesProvider = ({
  nodeId,
  readOnly,
  children,
}: {
  nodeId: string;
  readOnly?: boolean;
  children: ReactNode;
}) => {
  const report = useNodeIssuesReporter(nodeId);

  if (readOnly) {
    return <>{children}</>;
  }

  return (
    <AutomationNodeIssuesContext.Provider value={report}>
      {children}
    </AutomationNodeIssuesContext.Provider>
  );
};
