import type { LeadStage } from '@erxes/core-contract';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IconPlus, IconProgress } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input, PageContainer, PageHeader, ScrollArea, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';
import { useLeadsT } from '~/modules/leads/i18n';
import { leadStagesQuery, useLeadStageMutations, useLeadStages } from '~/modules/leads/useLeads';
import { RemoveStageDialog } from './RemoveStageDialog';
import { KINDS, StageRow } from './StageRow';

const NewStage = () => {
  const t = useLeadsT();
  const { create } = useLeadStageMutations();
  const [name, setName] = useState('');

  const add = () => {
    const next = name.trim();

    if (next) create.mutate({ name: next }, { onSuccess: () => setName('') });
  };

  return (
    <div className="flex items-center gap-2 bg-muted/40 px-3 py-2">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && add()}
        placeholder={t('settings.new-stage')}
        aria-label={t('settings.new-stage')}
        className="h-8 flex-1"
        maxLength={60}
      />
      <Button size="sm" className="h-8" onClick={add} disabled={!name.trim() || create.isPending}>
        <IconPlus />
        {t('settings.add')}
      </Button>
    </div>
  );
};

/** The stages in order; dragging one saves the new order at once. */
const StageList = ({
  stages,
  onRemove,
}: {
  stages: LeadStage[];
  onRemove: (stage: LeadStage) => void;
}) => {
  const client = useQueryClient();
  const { reorder } = useLeadStageMutations();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const ids = stages.map((stage) => stage.id);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const next = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    const position = new Map(next.map((id, index) => [id, index]));

    client.setQueryData(
      leadStagesQuery().queryKey,
      (data) =>
        data && {
          data: data.data.toSorted((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0)),
        },
    );
    reorder.mutate({ ids: next });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {stages.map((stage) => (
          <StageRow key={stage.id} stage={stage} onRemove={() => onRemove(stage)} />
        ))}
      </SortableContext>
    </DndContext>
  );
};

/** Settings › Lead stages: the steps leads move through, grouped by kind, in order. */
export const LeadStagesPage = () => {
  const t = useLeadsT();
  const can = useCan();
  const { stages, loading, error } = useLeadStages();
  const [removing, setRemoving] = useState<LeadStage | null>(null);

  if (!can('properties.manage')) return <Navigate to="/settings" replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('settings.title'), to: CONTACT_SETTINGS.leadStages, icon: IconProgress },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">{t('settings.description')}</p>
          <ul className="grid gap-1 text-xs text-muted-foreground">
            {KINDS.map((kind) => (
              <li key={kind}>
                <span className="font-medium text-foreground">{t(`kind.${kind}`)}:</span>{' '}
                {t(`kind-hint.${kind}`)}
              </li>
            ))}
          </ul>
          {error ? (
            <p className="py-12 text-center text-sm text-destructive">{messageOf(error)}</p>
          ) : loading ? (
            <Spinner containerClassName="py-12" />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <StageList stages={stages} onRemove={setRemoving} />
              <NewStage />
            </div>
          )}
        </div>
      </ScrollArea>
      <RemoveStageDialog stage={removing} stages={stages} onClose={() => setRemoving(null)} />
    </PageContainer>
  );
};
