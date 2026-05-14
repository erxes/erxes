import { Button, Collapsible, Spinner, cn, useConfirm, toast } from 'erxes-ui';
import { IChecklist, IChecklistItem } from '@/deals/types/checklists';
import {
  useChecklistItemsAdd,
  useChecklistItemsReorder,
  useChecklistsRemove,
} from '@/deals/cards/hooks/useChecklists';

import ChecklistItemAdd from './ChecklistItemAdd';
import ChecklistItemContent from './ChecklistItemContent';
import CircularProgressbar from '@/deals/components/common/CircularProgressbar';
import { IconTrash } from '@tabler/icons-react';
import SortableList from '@/deals/components/common/SortableList';
import { useState, useEffect } from 'react';

const ChecklistItem = ({
  item,
  stageId,
  dealId,
}: {
  item: IChecklist;
  stageId?: string;
  dealId?: string;
}) => {
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState<IChecklistItem[]>(item.items);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [hideChecked, setHideChecked] = useState(false);

  const { salesChecklistItemsAdd } = useChecklistItemsAdd();
  const { salesChecklistItemsReorder } = useChecklistItemsReorder();
  const { salesChecklistsRemove, salesChecklistsRemoveLoading, error } =
    useChecklistsRemove();
  const { confirm } = useConfirm();

  const checkedCount = items.filter((i) => i.isChecked).length;

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  const handleAdd = () => {
    const lines = newItem
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length > 0) {
      setNewItem('');
      setAdding(false);

      lines.forEach((content, index) => {
        salesChecklistItemsAdd({
          variables: {
            checklistId: item._id,
            content,
          },
          onCompleted: (data) => {
            if (data?.salesChecklistItemsAdd) {
              setItems((prev) => [...prev, data.salesChecklistItemsAdd]);
            }
          },
        });
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const onReorderItems = (reOrderedItems: IChecklistItem[]) => {
    setItems(reOrderedItems);

    const movedItem = reOrderedItems.find(
      (_, index) => items[index]._id !== reOrderedItems[index]._id,
    );

    if (!movedItem) return;

    const destinationIndex = reOrderedItems.findIndex(
      (i) => i._id === movedItem._id,
    );

    salesChecklistItemsReorder({
      variables: {
        destinationIndex,
        _id: movedItem._id,
      },
    });
  };

  const onDeleteChecklist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    confirm({
      message: `Are you sure you want to delete ${item.title}?`,
    }).then(() => {
      salesChecklistsRemove({
        variables: {
          _id: id,
        },
        onError: (error) => {
          if (
            error.message?.includes('permission') ||
            error.message?.includes('denied')
          ) {
            toast({
              title: 'Permission Denied',
              description:
                'You do not have permission to delete this checklist.',
              variant: 'destructive',
            });
          }
        },
      });
    });
  };

  return (
    <Collapsible
      className="checklists mb-4 bg-accent rounded-lg hover:rounded-lg"
      open={open}
      onOpenChange={setOpen}
    >
      <Collapsible.TriggerButton className="flex items-center justify-between gap-2 h-full p-2">
        <div className="flex items-center gap-2 flex-1">
          <Collapsible.TriggerIcon className="group-data-[state=open]/checklists:rotate-180" />
          <h4 className="text-sm">{item.title}</h4>
          <CircularProgressbar
            value={checkedCount}
            max={items.length || 1}
            size={20}
            className="ml-2"
            strokeWidth={3}
          />
        </div>
        <div className="flex items-center gap-2">
          {open && (
            <Button
              variant="outline"
              size="sm"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setHideChecked(!hideChecked);
              }}
            >
              {hideChecked
                ? `Show checked items (${checkedCount})`
                : 'Hide Completed Items'}
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={(e) => onDeleteChecklist(e, item._id)}
            title="Delete checklist"
            size="sm"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className={cn(salesChecklistsRemoveLoading && 'opacity-50')}
          >
            <IconTrash />{' '}
            {salesChecklistsRemoveLoading ? <Spinner /> : 'Delete'}
          </Button>
        </div>
      </Collapsible.TriggerButton>

      <Collapsible.Content
        className={cn(open && 'flex flex-col gap-1 py-1 pl-2 bg-white')}
      >
        <SortableList
          items={hideChecked ? items.filter((i) => !i.isChecked) : items}
          onReorder={(items) => onReorderItems(items)}
          itemKey="_id"
          className="flex flex-col gap-1"
          renderItem={(item: IChecklistItem, index: number) => (
            <ChecklistItemContent
              item={item}
              index={index}
              setItems={setItems}
              stageId={stageId}
              dealId={dealId}
            />
          )}
        />

        <ChecklistItemAdd
          adding={adding}
          setAdding={setAdding}
          newItem={newItem}
          setNewItem={setNewItem}
          handleAdd={handleAdd}
          handleKeyDown={handleKeyDown}
        />
      </Collapsible.Content>
    </Collapsible>
  );
};

export default ChecklistItem;
