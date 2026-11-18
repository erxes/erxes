import type { EbarimtPrintBlock } from '@erxes/core-contract';
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { cn, Switch, useSortList, useSortRoleDescription } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSortSensors } from '~/lib/sortSensors';

const BLOCK_LABELS: Record<EbarimtPrintBlock['type'], [string, string]> = {
  merchant: ['Business', 'Company name, TIN, branch and POS'],
  header: ['Header text', 'Your text above the receipt'],
  bill: ['Bill', 'Bill number (DDTD) and date'],
  buyer: ['Buyer', 'The company or the person’s consumer number'],
  lines: ['Items', 'Each item with its quantity, price and amount'],
  totals: ['Totals', 'Total, VAT and city tax'],
  qr: ['QR code', 'For the buyer to scan into the eBarimt app'],
  lottery: ['Lottery number', 'For receipts to a person'],
  footer: ['Footer text', 'Your text below the receipt'],
};

const BlockRow = ({
  block,
  onToggle,
}: {
  block: EbarimtPrintBlock;
  onToggle: (visible: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt.print' });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.type,
    attributes: { roleDescription: useSortRoleDescription() },
  });

  const [label, hint] = BLOCK_LABELS[block.type];
  const name = t(`block.${block.type}`, label);

  return (
    <li
      ref={setNodeRef}
      style={{
        '--sortable-transform': CSS.Transform.toString(transform),
        '--sortable-transition': transition,
      }}
      className={cn(
        'sortable flex items-center gap-3 border-b bg-background px-3 py-2 last:border-b-0',
        isDragging && 'relative z-10 shadow-md',
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={t('reorder', 'Move {{name}}', { name })}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </button>
      <span className={cn('min-w-0 flex-1', !block.visible && 'text-muted-foreground')}>
        <span className="block text-sm">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {t(`block-hint.${block.type}`, hint)}
        </span>
      </span>
      <Switch
        checked={block.visible}
        aria-label={t('show', 'Print {{name}}', { name })}
        onCheckedChange={onToggle}
      />
    </li>
  );
};

/** The receipt's parts: drag to reorder, switch to print or leave out. */
export const PrintBlockList = ({
  blocks,
  onChange,
}: {
  blocks: EbarimtPrintBlock[];
  onChange: (blocks: EbarimtPrintBlock[]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt.print' });
  const sensors = useSortSensors();
  const ids = blocks.map((block) => block.type);

  const sortList = useSortList((id) => {
    const block = blocks.find((item) => item.type === id);

    return block ? t(`block.${block.type}`, BLOCK_LABELS[block.type][0]) : String(id);
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const indexOf = (id: unknown) => blocks.findIndex((block) => block.type === id);

    onChange(arrayMove(blocks, indexOf(active.id), indexOf(over.id)));
  };

  return (
    <DndContext
      {...sortList}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="overflow-hidden rounded-lg border">
          {blocks.map((block) => (
            <BlockRow
              key={block.type}
              block={block}
              onToggle={(visible) =>
                onChange(
                  blocks.map((item) => (item.type === block.type ? { ...item, visible } : item)),
                )
              }
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};
