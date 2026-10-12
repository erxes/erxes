import { useDecisionTableFormContext } from '@/automations/components/builder/nodes/actions/decisionTable/context/DecisionTableFormContext';
import { toDecisionTableConfig } from '@/automations/components/builder/nodes/actions/decisionTable/states/decisionTableForm';
import { analyzeDecisionTable } from '@/automations/components/builder/nodes/actions/decisionTable/utils/analyzeDecisionTable';
import { useWatch } from 'react-hook-form';

export const useDecisionTableAnalysis = () => {
  const { form } = useDecisionTableFormContext();
  // Subscribes to every edit; the complete values are read below
  useWatch({ control: form.control });

  const config = toDecisionTableConfig(form.getValues());
  const analysis = analyzeDecisionTable(config);

  return {
    ...analysis,
    rowCount: config.rows.length,
    warningCount:
      analysis.unreachableRows.length +
      analysis.gaps.length +
      (analysis.gapsTruncated ? 1 : 0),
  };
};
