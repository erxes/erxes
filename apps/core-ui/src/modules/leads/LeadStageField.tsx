import type { LeadRecordType } from '@erxes/core-contract';
import { IconProgress } from '@tabler/icons-react';
import { useState } from 'react';
import { PanelField } from '~/modules/side-panel/PanelField';
import { DisqualifyDialog } from './DisqualifyDialog';
import { LeadStageMenu, LeadStageTrigger } from './LeadStageBadge';
import { type LeadRecord, useLeadStages, useMoveLeads } from './useLeads';
import { useLeadsT } from './i18n';

/** A lead's stage as a record field (click to move); nothing for customers. */
export const LeadStageField = ({
  recordType,
  record,
}: {
  recordType: LeadRecordType;
  record: LeadRecord;
}) => {
  const { stages, byId } = useLeadStages();
  const t = useLeadsT();
  const move = useMoveLeads();
  const [disqualifying, setDisqualifying] = useState<string | null>(null);

  if (record.state !== 'lead') return null;

  return (
    <PanelField icon={IconProgress} label={t('stage')}>
      <div className="flex h-7 items-center px-1">
        <LeadStageMenu
          stages={stages}
          value={record.leadStageId}
          onSelect={(next) =>
            next.kind === 'disqualified'
              ? setDisqualifying(next.id)
              : move.mutate({ recordType, ids: [record.id], stageId: next.id })
          }
        >
          <LeadStageTrigger stage={record.leadStageId ? byId.get(record.leadStageId) : null} />
        </LeadStageMenu>
      </div>
      <DisqualifyDialog
        recordType={recordType}
        ids={[record.id]}
        stageId={disqualifying}
        onClose={() => setDisqualifying(null)}
      />
    </PanelField>
  );
};
