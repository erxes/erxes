import { DecisionTableAnalysisNotice } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableAnalysisNotice';
import { DecisionTableRowsDialog } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableRowsDialog';
import { DecisionTableSectionHeader } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableSectionHeader';
import { useDecisionTableAnalysis } from '@/automations/components/builder/nodes/actions/decisionTable/hooks/useDecisionTableAnalysis';
import { useDecisionTableFormContext } from '@/automations/components/builder/nodes/actions/decisionTable/context/DecisionTableFormContext';
import { IconTable } from '@tabler/icons-react';
import { Badge, Button } from 'erxes-ui';
import { useState } from 'react';

export const DecisionTableRowsSection = () => {
  const [open, setOpen] = useState(false);
  const { form } = useDecisionTableFormContext();
  const { rowCount, warningCount } = useDecisionTableAnalysis();
  const rowErrors = form.formState.errors.rows;

  return (
    <div className="flex flex-col gap-3">
      <DecisionTableSectionHeader
        title="Rows"
        description="Rules tried top to bottom; the first match wins"
      />
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {rowCount} row{rowCount === 1 ? '' : 's'}
        </Badge>
        {warningCount > 0 && (
          <Badge variant="warning">
            {warningCount} warning{warningCount === 1 ? '' : 's'}
          </Badge>
        )}
        {rowErrors && (
          <Badge variant="destructive">Some cells are invalid</Badge>
        )}
      </div>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <IconTable />
        Edit rows
      </Button>
      <DecisionTableAnalysisNotice />
      <DecisionTableRowsDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};
