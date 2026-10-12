import { useDecisionTableAnalysis } from '@/automations/components/builder/nodes/actions/decisionTable/hooks/useDecisionTableAnalysis';
import { IconAlertTriangle } from '@tabler/icons-react';

const DecisionTableWarning = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
    <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0" />
    <span>{children}</span>
  </div>
);

export const DecisionTableAnalysisNotice = () => {
  const { unreachableRows, gaps, gapsTruncated } = useDecisionTableAnalysis();

  return (
    <div className="flex flex-col gap-1.5">
      {unreachableRows.map(({ row, coveredBy }) => (
        <DecisionTableWarning key={`row-${row}`}>
          Row {row} is never reached: row {coveredBy} already matches everything
          it matches
        </DecisionTableWarning>
      ))}
      {gaps.map((gap, index) => (
        <DecisionTableWarning key={`gap-${index}`}>
          No row covers{' '}
          {gap.fixed.map(({ key, value }) => `${key} ${value}, `).join('')}
          {gap.key} {gap.values}; these fall to the no match setting
        </DecisionTableWarning>
      ))}
      {gapsTruncated && (
        <DecisionTableWarning>
          More uncovered combinations exist than are listed here
        </DecisionTableWarning>
      )}
    </div>
  );
};
