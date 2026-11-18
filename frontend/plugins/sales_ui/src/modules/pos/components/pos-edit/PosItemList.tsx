import { type Icon, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface PosItemListItem {
  id: string;
  title: string;
}

interface PosItemListProps {
  items: PosItemListItem[];
  emptyIcon: Icon;
  emptyText: string;
  addLabel: string;
  addDisabled?: boolean;
  deleting?: boolean;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PosItemList = ({
  items,
  emptyIcon: EmptyIcon,
  emptyText,
  addLabel,
  addDisabled,
  deleting,
  onAdd,
  onEdit,
  onDelete,
}: PosItemListProps) => {
  const { t } = useTranslation('sales');

  const addButton = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="self-start text-accent-foreground"
      disabled={addDisabled}
      onClick={onAdd}
    >
      <IconPlus />
      {addLabel}
    </Button>
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/40 px-6 py-8 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <EmptyIcon className="size-5 text-muted-foreground" />
        </div>
        <p className="max-w-sm text-xs text-muted-foreground">{emptyText}</p>
        {addButton}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group/pos-item flex h-8 items-center justify-between gap-4 rounded-md px-2 hover:bg-accent/50"
          >
            <span className="flex min-w-0 items-center gap-2">
              <EmptyIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-medium">{item.title}</span>
            </span>
            <div className="flex shrink-0 gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground"
                aria-label={t('edit')}
                onClick={() => onEdit(item.id)}
              >
                <IconEdit />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('delete')}
                disabled={deleting}
                onClick={() => onDelete(item.id)}
                className="size-7 text-muted-foreground hover:text-destructive"
              >
                <IconTrash />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {addButton}
    </div>
  );
};
