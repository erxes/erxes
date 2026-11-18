import type { LeadRecordType } from '@erxes/core-contract';
import { Board, type BoardMove } from 'erxes-ui';
import { useState } from 'react';
import { messageOf } from '@erxes/core-contract/client';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { DisqualifyDialog } from './DisqualifyDialog';
import { StageColumn } from './StageColumn';
import { useBoardMove } from './useBoardMove';
import { useLeadStages } from './useLeads';

/**
 * Leads as a board, one column per stage: drag a card to move the lead (a
 * disqualified column asks why first). The card lands at once, in the place
 * the server will list it (columns are newest first), so nothing jumps when
 * the columns reload; only the two columns a move touches reload.
 */

/** The lead lists' Display choice (table or board), one for people and companies. */
export const LEADS_DISPLAY = 'leads';

export const LeadsBoard = ({ recordType }: { recordType: LeadRecordType }) => {
  const { stages, loading, error } = useLeadStages();
  const move = useBoardMove(recordType);
  const { openNewRecord } = useSidePanel();
  const [disqualify, setDisqualify] = useState<{ id: string; stageId: string } | null>(null);

  const onMove = ({ id, columnId }: BoardMove) => {
    const stage = stages.find((item) => item.id === columnId);

    if (stage?.kind === 'disqualified') setDisqualify({ id, stageId: stage.id });
    else if (stage) move.mutate({ recordType, ids: [id], stageId: stage.id });
  };

  const add = (stageId: string) =>
    openNewRecord(recordType === 'company' ? 'core:company' : 'core:customer', {
      state: 'lead',
      leadStageId: stageId,
    });

  if (error) return <p className="p-6 text-sm text-destructive-text">{messageOf(error)}</p>;

  if (loading) return <Board.Skeleton />;

  return (
    <>
      <Board onMove={onMove}>
        {stages.map((stage) => (
          <StageColumn key={stage.id} recordType={recordType} stage={stage} onAdd={add} />
        ))}
      </Board>
      <DisqualifyDialog
        recordType={recordType}
        ids={disqualify ? [disqualify.id] : []}
        stageId={disqualify?.stageId ?? null}
        onClose={() => setDisqualify(null)}
      />
    </>
  );
};
