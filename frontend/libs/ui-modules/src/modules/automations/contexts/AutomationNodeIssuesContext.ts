import { createContext, useContext, useEffect } from 'react';

type TReportNodeIssues = (issues: string[]) => void;

// The builder provides this around each node's content; anywhere else (history,
// read-only views) reporting is a no-op.
export const AutomationNodeIssuesContext = createContext<TReportNodeIssues>(
  () => undefined,
);

/**
 * A node's content says what is still missing in its own configuration; the
 * builder draws the warning and refuses activation while any remains.
 */
export const useReportNodeIssues = (issues: string[]) => {
  const report = useContext(AutomationNodeIssuesContext);
  const key = issues.join('\n');

  useEffect(() => {
    report(key ? key.split('\n') : []);
  }, [key, report]);
};
