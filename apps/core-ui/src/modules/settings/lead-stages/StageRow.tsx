import type { LeadStage, LeadStageKind } from '@erxes/core-contract';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { Button, Input, Select } from 'erxes-ui';
import { useState } from 'react';
import { useLeadsT, useStageName } from '~/modules/leads/i18n';
import { useLeadStageMutations } from '~/modules/leads/useLeads';

export const KINDS: LeadStageKind[] = ['open', 'qualified', 'disqualified'];

const KindSelect = ({ stage }: { stage: LeadStage }) => {
  const t = useLeadsT();
  const { update } = useLeadStageMutations();

  return (
    <Select
      value={stage.kind}
      onValueChange={(value) => {
        const kind = KINDS.find((item) => item === value);

        if (kind) update.mutate({ id: stage.id, kind });
      }}
    >
      <Select.Trigger className="h-8 w-36" aria-label={t('settings.kind')}>
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
  );
};

export const StageRow = ({ stage, onRemove }: { stage: LeadStage; onRemove: () => void }) => {
  const t = useLeadsT();
  const stageName = useStageName();
  const { update } = useLeadStageMutations();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
  });

  // Default names show translated; saving another name keeps it as written.
  const shown = stageName(stage.name);
  const [draft, setDraft] = useState<string | null>(null);

  const saveName = () => {
    const next = (draft ?? shown).trim();

    if (next && next !== shown) update.mutate({ id: stage.id, name: next });
    setDraft(null);
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
          aria-label={t('settings.colour')}
          onChange={(event) => update.mutate({ id: stage.id, color: event.target.value })}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <Input
        value={draft ?? shown}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={saveName}
        onKeyDown={(event) => event.key === 'Enter' && saveName()}
        aria-label={t('settings.name')}
        className="h-8 flex-1"
        maxLength={60}
      />
      <KindSelect stage={stage} />
      <span
        className="w-36 text-right text-xs tabular-nums text-muted-foreground"
        title={t('settings.counts', { people: stage.leadCount, companies: stage.companyLeadCount })}
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
