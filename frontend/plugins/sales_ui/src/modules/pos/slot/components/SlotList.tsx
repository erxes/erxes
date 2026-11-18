import { IconCopy, IconTrash } from '@tabler/icons-react';
import { Badge, Button, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { SlotNode } from '@/pos/slot/types';

interface SlotListProps {
  nodes: SlotNode[];
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SlotList = ({
  nodes,
  onSelect,
  onDuplicate,
  onDelete,
}: SlotListProps) => {
  const { t } = useTranslation('sales');

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-4">
        <span className="text-sm font-medium">{t('slots')}</span>
        <Badge variant="secondary">{nodes.length}</Badge>
      </div>
      {nodes.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          {t('no-slots-available')}
        </p>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <ul className="p-2">
            {nodes.map((node) => (
              <li
                key={node.id}
                className="group flex items-center gap-1 rounded-md pr-1 hover:bg-accent"
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1.5 text-left"
                  onClick={() => onSelect(node.id)}
                >
                  <span
                    className="size-3.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: node.data.color }}
                  />
                  <span className="truncate text-sm">
                    {node.data.name || node.data.code}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    #{node.data.code}
                  </span>
                </button>
                <div className="flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={t('duplicate')}
                    onClick={() => onDuplicate(node.id)}
                  >
                    <IconCopy />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    aria-label={t('delete')}
                    onClick={() => onDelete(node.id)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
};
