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
      variant="outline"
      size="sm"
      disabled={addDisabled}
      onClick={onAdd}
    >
      <IconPlus />
      {addLabel}
    </Button>
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <EmptyIcon className="size-5 text-muted-foreground" />
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyText}</p>
        {addButton}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="divide-y rounded-lg border">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <span className="truncate text-sm font-medium">{item.title}</span>
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
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
                className="text-destructive"
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
