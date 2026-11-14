import type { LeadRecordType } from '@erxes/core-contract';
import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { cn, Skeleton } from 'erxes-ui';
import { useState } from 'react';
import { messageOf } from '~/lib/api';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { DisqualifyDialog } from './DisqualifyDialog';
import { CARD, CardBody } from './LeadCard';
import { StageColumn } from './StageColumn';
import { type BoardLead, findCachedLead, useBoardMove } from './useBoardMove';
import { useLeadStages } from './useLeads';

/**
 * Leads as a board, one column per stage: drag a card to move the lead (a
 * disqualified column asks why first). The card lands at once, in the place
 * the server will list it (columns are newest first), so nothing jumps when
 * the columns reload; only the two columns a move touches reload.
 */

const COLUMN_SKELETONS = ['first', 'second', 'third', 'fourth'];

/** The dragged copy glides into the card's new place. */
const DROP_ANIMATION: DropAnimation = {
  duration: 200,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
};

const useBoardSensors = () =>
  useSensors(
    // A click opens the lead; only a real drag moves it.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

export const LeadsBoard = ({ recordType }: { recordType: LeadRecordType }) => {
  const { stages, loading, error } = useLeadStages();
  const client = useQueryClient();
  const move = useBoardMove(recordType);
  const { openNewRecord } = useSidePanel();
  const sensors = useBoardSensors();
  const [dragging, setDragging] = useState<BoardLead | null>(null);
  const [disqualify, setDisqualify] = useState<{ id: string; stageId: string } | null>(null);

  const onDragStart = ({ active }: DragStartEvent) =>
    setDragging(findCachedLead(client, recordType, String(active.id)) ?? null);

  const onDragEnd = ({ over }: DragEndEvent) => {
    setDragging(null);

    const stage = stages.find((item) => item.id === over?.id);

    if (!dragging || !stage || stage.id === dragging.leadStageId) return;

    if (stage.kind === 'disqualified') setDisqualify({ id: dragging.id, stageId: stage.id });
    else move.mutate({ recordType, ids: [dragging.id], stageId: stage.id });
  };

  const add = (stageId: string) =>
    openNewRecord(recordType === 'company' ? 'core:company' : 'core:customer', {
      state: 'lead',
      leadStageId: stageId,
    });

  if (error) return <p className="p-6 text-sm text-destructive">{messageOf(error)}</p>;

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        {COLUMN_SKELETONS.map((key) => (
          <Skeleton key={key} radius="xl" className="h-full w-72 shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <div
        className={cn(
          'flex min-h-0 flex-1 gap-3 overflow-x-auto p-3',
          dragging && 'cursor-grabbing',
        )}
      >
        {stages.map((stage) => (
          <StageColumn key={stage.id} recordType={recordType} stage={stage} onAdd={add} />
        ))}
      </div>
      <DragOverlay dropAnimation={DROP_ANIMATION}>
        {dragging && (
          <div
            className={cn(
              CARD,
              'w-[272px] rotate-[1.5deg] cursor-grabbing shadow-lg ring-1 ring-primary/20',
            )}
          >
            <CardBody lead={dragging} />
          </div>
        )}
      </DragOverlay>
      <DisqualifyDialog
        recordType={recordType}
        ids={disqualify ? [disqualify.id] : []}
        stageId={disqualify?.stageId ?? null}
        onClose={() => setDisqualify(null)}
      />
    </DndContext>
  );
};
