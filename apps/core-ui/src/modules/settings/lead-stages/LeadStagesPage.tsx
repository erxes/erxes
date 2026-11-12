import type { LeadStage, LeadStageKind } from '@erxes/core-contract';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus, IconProgress, IconTrash } from '@tabler/icons-react';
import { Button, Dialog, Input, PageContainer, ScrollArea, Select, Spinner } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { useCan } from '~/modules/auth/session';
import { KIND_LABELS, useLeadStageMutations, useLeadStages } from '~/modules/leads/useLeads';

const KIND_HINTS: Record<LeadStageKind, string> = {
  open: 'Still being worked. New leads start in the first one.',
  qualified: 'Ready to become a customer. Converted leads land in the first one.',
  disqualified: 'Lost. Moving a lead here asks why.',
};

const StageRow = ({ stage, onRemove }: { stage: LeadStage; onRemove: () => void }) => {
  const { update } = useLeadStageMutations();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id });
  const [name, setName] = useState(stage.name);

  useEffect(() => setName(stage.name), [stage.name]);

  const saveName = () => {
    const next = name.trim();

    if (next && next !== stage.name) update.mutate({ id: stage.id, name: next });
    else setName(stage.name);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 border-b bg-background px-3 py-2 last:border-b-0 ${isDragging ? 'relative z-10 shadow-md' : ''}`}
    >
      <button type="button" className="cursor-grab text-muted-foreground active:cursor-grabbing" aria-label="Drag to reorder" {...attributes} {...listeners}>
        <IconGripVertical className="size-4" />
      </button>
      <label className="relative size-6 shrink-0 cursor-pointer overflow-hidden rounded-full border" style={{ background: stage.color }} title="Colour">
        <input
          type="color"
          value={stage.color}
          onChange={(event) => update.mutate({ id: stage.id, color: event.target.value })}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <Input value={name} onChange={(event) => setName(event.target.value)} onBlur={saveName} onKeyDown={(event) => event.key === 'Enter' && saveName()} className="h-8 flex-1" maxLength={60} />
      <Select value={stage.kind} onValueChange={(kind) => update.mutate({ id: stage.id, kind: kind as LeadStageKind })}>
        <Select.Trigger className="h-8 w-36">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {(Object.keys(KIND_LABELS) as LeadStageKind[]).map((kind) => (
            <Select.Item key={kind} value={kind}>
              {KIND_LABELS[kind]}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <span className="w-20 text-right text-xs tabular-nums text-muted-foreground">{stage.leadCount.toLocaleString('en')} leads</span>
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Delete stage">
        <IconTrash className="size-4" />
      </Button>
    </div>
  );
};

/** Deleting a stage with leads in it: choose where they go. */
const RemoveDialog = ({ stage, stages, onClose }: { stage: LeadStage | null; stages: LeadStage[]; onClose: () => void }) => {
  const { remove } = useLeadStageMutations();
  const others = stages.filter((item) => item.id !== stage?.id);
  const [moveTo, setMoveTo] = useState('');

  useEffect(() => setMoveTo(others.find((item) => item.kind === stage?.kind)?.id ?? others[0]?.id ?? ''), [stage?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={Boolean(stage)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>Delete “{stage?.name}”</Dialog.Title>
          <Dialog.Description>
            {stage?.leadCount
              ? `${stage.leadCount} leads are in it. They move to the stage you choose; their history keeps the old one.`
              : 'No leads are in it. Its history stays in reports.'}
          </Dialog.Description>
        </Dialog.Header>
        {Boolean(stage?.leadCount) && (
          <Select value={moveTo} onValueChange={setMoveTo}>
            <Select.Trigger>
              <Select.Value placeholder="Move them to" />
            </Select.Trigger>
            <Select.Content>
              {others.map((item) => (
                <Select.Item key={item.id} value={item.id}>
                  {item.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
        <Dialog.Footer>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => remove.mutate({ id: stage!.id, moveTo: stage!.leadCount ? moveTo : undefined }, { onSuccess: onClose })}
          >
            {remove.isPending && <Spinner size="sm" />}
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

/** Settings › Lead stages: the steps leads move through, grouped by kind, in order. */
export const LeadStagesPage = () => {
  const can = useCan();
  const { stages, loading } = useLeadStages();
  const { create, reorder } = useLeadStageMutations();
  const [order, setOrder] = useState<string[]>([]);
  const [removing, setRemoving] = useState<LeadStage | null>(null);
  const [newName, setNewName] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => setOrder(stages.map((stage) => stage.id)), [stages]);

  if (!can('properties.manage')) return <Navigate to="/settings" replace />;

  const ordered = order.map((id) => stages.find((stage) => stage.id === id)).filter((stage): stage is LeadStage => Boolean(stage));

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
          <AppBreadcrumb items={[{ label: 'Lead stages', to: '/settings/lead-stages', icon: IconProgress }]} />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            The steps a lead goes through before it becomes a customer. Drag to reorder; the board and the funnel follow this order.
          </p>
          <ul className="grid gap-1 text-xs text-muted-foreground">
            {(Object.keys(KIND_HINTS) as LeadStageKind[]).map((kind) => (
              <li key={kind}>
                <span className="font-medium text-foreground">{KIND_LABELS[kind]}:</span> {KIND_HINTS[kind]}
              </li>
            ))}
          </ul>
          {loading ? (
            <Spinner containerClassName="py-12" />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
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
                  placeholder="New stage"
                  className="h-8 flex-1"
                  maxLength={60}
                />
                <Button size="sm" onClick={add} disabled={!newName.trim() || create.isPending}>
                  <IconPlus />
                  Add
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
