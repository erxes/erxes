import type { LeadRecordType } from '@erxes/core-contract';
import { IconUserCheck } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { ConvertDialog, DisqualifyDialog } from './LeadActions';
import { LeadStageMenu, LeadStageTrigger } from './LeadStageBadge';
import { type LeadRecord, useLeadStages, useMoveLeads } from './useLeads';

/**
 * A lead's own controls in its record header: the stage (click to move) and
 * Convert. Nothing for customers.
 */
export const LeadHeaderActions = ({ recordType, record }: { recordType: LeadRecordType; record?: LeadRecord | null }) => {
  const { stages, byId } = useLeadStages();
  const move = useMoveLeads();
  const [converting, setConverting] = useState(false);
  const [disqualifying, setDisqualifying] = useState<string | null>(null);

  if (!record || record.state !== 'lead') return null;

  return (
    <>
      <LeadStageMenu
        stages={stages}
        value={record.leadStageId}
        align="end"
        onSelect={(next) => (next.kind === 'disqualified' ? setDisqualifying(next.id) : move.mutate({ recordType, ids: [record.id], stageId: next.id }))}
      >
        <LeadStageTrigger stage={record.leadStageId ? byId.get(record.leadStageId) : null} />
      </LeadStageMenu>
      <Button size="sm" className="h-7 gap-1.5 px-2.5" onClick={() => setConverting(true)}>
        <IconUserCheck className="size-4" />
        Convert
      </Button>
      <ConvertDialog recordType={recordType} leads={[record]} open={converting} onOpenChange={setConverting} />
      <DisqualifyDialog recordType={recordType} ids={[record.id]} stageId={disqualifying} onClose={() => setDisqualifying(null)} />
    </>
  );
};
