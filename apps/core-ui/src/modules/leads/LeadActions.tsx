import type { LeadRecordType } from '@erxes/core-contract';
import { IconArrowRight, IconCircleX, IconUserCheck } from '@tabler/icons-react';
import { Button, RecordTable } from 'erxes-ui';
import { useState } from 'react';
import { ConvertDialog } from './ConvertDialog';
import { DisqualifyDialog } from './DisqualifyDialog';
import { useLeadsT } from './i18n';
import { LeadStageMenu } from './LeadStageBadge';
import { firstOfKind, type LeadRecord, useLeadStages, useMoveLeads } from './useLeads';

/** The command bar's lead actions on the selected rows: move, convert, disqualify. */
export const LeadsBulkActions = ({
  recordType,
  leads,
}: {
  recordType: LeadRecordType;
  leads: LeadRecord[];
}) => {
  const t = useLeadsT();
  const { table } = RecordTable.useRecordTable();
  const { stages } = useLeadStages();
  const move = useMoveLeads();
  const [converting, setConverting] = useState(false);
  const [disqualifying, setDisqualifying] = useState<string | null>(null);
  const ids = leads.map((lead) => lead.id);
  const [only] = leads;
  const clear = () => table.setRowSelection({});
  const lost = firstOfKind(stages, 'disqualified');

  return (
    <>
      <LeadStageMenu
        stages={stages}
        value={leads.length === 1 && only ? only.leadStageId : null}
        align="end"
        onSelect={(stage) =>
          stage.kind === 'disqualified'
            ? setDisqualifying(stage.id)
            : move.mutate({ recordType, ids, stageId: stage.id }, { onSuccess: clear })
        }
      >
        <Button variant="secondary">
          <IconArrowRight />
          {t('actions.move-to')}
        </Button>
      </LeadStageMenu>
      <Button variant="secondary" onClick={() => setConverting(true)}>
        <IconUserCheck />
        {t('actions.convert')}
      </Button>
      {lost && (
        <Button variant="secondary" onClick={() => setDisqualifying(lost.id)}>
          <IconCircleX />
          {t('actions.disqualify')}
        </Button>
      )}
      <ConvertDialog
        recordType={recordType}
        leads={leads}
        open={converting}
        onOpenChange={setConverting}
        onDone={clear}
      />
      <DisqualifyDialog
        recordType={recordType}
        ids={ids}
        stageId={disqualifying}
        onClose={() => setDisqualifying(null)}
        onDone={clear}
      />
    </>
  );
};
