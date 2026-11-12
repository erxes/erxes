import type { LeadStage, LeadStageKind } from '@erxes/core-contract';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus, IconProgress, IconTrash } from '@tabler/icons-react';
import { Button, Dialog, Input, PageContainer, ScrollArea, Select, Spinner } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { useCan } from '~/modules/auth/session';
import { useLeadStageMutations, useLeadStages } from '~/modules/leads/useLeads';
import { useLeadsT, useStageName } from '~/modules/leads/i18n';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';

const KINDS: LeadStageKind[] = ['open', 'qualified', 'disqualified'];

const StageRow = ({ stage, onRemove }: { stage: LeadStage; onRemove: () => void }) => {
  const t = useLeadsT();
  const stageName = useStageName();
  const { update } = useLeadStageMutations();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
  });

  // Default names show translated; saving another name keeps it as written.
  const shown = stageName(stage.name);
  const [name, setName] = useState(shown);

  useEffect(() => setName(shown), [shown]);

  const saveName = () => {
    const next = name.trim();

    if (next && next !== shown) update.mutate({ id: stage.id, name: next });
    else setName(shown);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 border-b bg-background px-3 py-2 last:border-b-0 ${isDragging ? 'relative z-10 shadow-md' : ''}`}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={t('settings.reorder')}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </button>
      <label
        className="relative size-6 shrink-0 cursor-pointer overflow-hidden rounded-full border"
        style={{ background: stage.color }}
        title={t('settings.colour')}
      >
        <input
          type="color"
          value={stage.color}
          onChange={(event) => update.mutate({ id: stage.id, color: event.target.value })}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={saveName}
        onKeyDown={(event) => event.key === 'Enter' && saveName()}
        className="h-8 flex-1"
        maxLength={60}
      />
      <Select
        value={stage.kind}
        onValueChange={(kind) => update.mutate({ id: stage.id, kind: kind as LeadStageKind })}
      >
        <Select.Trigger className="h-8 w-36">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {KINDS.map((kind) => (
            <Select.Item key={kind} value={kind}>
              {t(`kind.${kind}`)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <span
        className="w-36 text-right text-xs tabular-nums text-muted-foreground"
        title={t('settings.counts', {
          people: stage.leadCount,
          companies: stage.companyLeadCount,
        })}
      >
        {t('settings.counts', {
          people: stage.leadCount.toLocaleString('en'),
          companies: stage.companyLeadCount.toLocaleString('en'),
        })}
      </span>
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label={t('settings.delete')}>
        <IconTrash className="size-4" />
      </Button>
    </div>
  );
};

/** Deleting a stage with leads in it: choose where they go. */
const RemoveDialog = ({
  stage,
  stages,
  onClose,
}: {
  stage: LeadStage | null;
  stages: LeadStage[];
  onClose: () => void;
}) => {
  const t = useLeadsT();
  const stageName = useStageName();
  const { remove } = useLeadStageMutations();
  const others = stages.filter((item) => item.id !== stage?.id);
  const [moveTo, setMoveTo] = useState('');

  useEffect(
    () => setMoveTo(others.find((item) => item.kind === stage?.kind)?.id ?? others[0]?.id ?? ''),
    [stage?.id],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={Boolean(stage)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {t('settings.delete-title', { name: stageName(stage?.name) })}
          </Dialog.Title>
          <Dialog.Description>
            {stage && stage.leadCount + stage.companyLeadCount
              ? t('settings.delete-in-use', {
                  count: stage.leadCount + stage.companyLeadCount,
                })
              : t('settings.delete-empty')}
          </Dialog.Description>
        </Dialog.Header>
        {Boolean(stage && stage.leadCount + stage.companyLeadCount) && (
          <Select value={moveTo} onValueChange={setMoveTo}>
            <Select.Trigger>
              <Select.Value placeholder={t('settings.move-to')} />
            </Select.Trigger>
            <Select.Content>
              {others.map((item) => (
                <Select.Item key={item.id} value={item.id}>
                  {stageName(item.name)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
        <Dialog.Footer>
          <Button variant="outline" onClick={onClose}>
            {t('settings.cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(
                {
                  id: stage!.id,
                  moveTo: stage!.leadCount + stage!.companyLeadCount ? moveTo : undefined,
                },
                { onSuccess: onClose },
              )
            }
          >
            {remove.isPending && <Spinner size="sm" />}
            {t('settings.confirm')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

/** Settings › Lead stages: the steps leads move through, grouped by kind, in order. */
export const LeadStagesPage = () => {
  const t = useLeadsT();
  const can = useCan();
  const { stages, loading } = useLeadStages();
  const { create, reorder } = useLeadStageMutations();
  const [order, setOrder] = useState<string[]>([]);
  const [removing, setRemoving] = useState<LeadStage | null>(null);
  const [newName, setNewName] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => setOrder(stages.map((stage) => stage.id)), [stages]);

  if (!can('properties.manage')) return <Navigate to="/settings" replace />;

  const ordered = order
    .map((id) => stages.find((stage) => stage.id === id))
    .filter((stage): stage is LeadStage => Boolean(stage));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const next = arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id)));

    setOrder(next);
    reorder.mutate(next);
  };

  const add = () => {
    const name = newName.trim();

    if (name) create.mutate({ name }, { onSuccess: () => setNewName('') });
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('settings.title'),
                to: CONTACT_SETTINGS.leadStages,
                icon: IconProgress,
              },
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
          {loading ? (
            <Spinner containerClassName="py-12" />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext items={order} strategy={verticalListSortingStrategy}>
                  {ordered.map((stage) => (
                    <StageRow key={stage.id} stage={stage} onRemove={() => setRemoving(stage)} />
                  ))}
                </SortableContext>
              </DndContext>
              <div className="flex items-center gap-2 bg-muted/40 px-3 py-2">
                <Input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && add()}
                  placeholder={t('settings.new-stage')}
                  className="h-8 flex-1"
                  maxLength={60}
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={add}
                  disabled={!newName.trim() || create.isPending}
                >
                  <IconPlus />
                  {t('settings.add')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <RemoveDialog stage={removing} stages={stages} onClose={() => setRemoving(null)} />
    </PageContainer>
  );
};
