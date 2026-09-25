import {
  Button,
  Collapsible,
  Input,
  Spinner,
  cn,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IChecklist, IChecklistItem } from '@/deals/types/checklists';
import {
  useChecklistItemsAdd,
  useChecklistItemsReorder,
  useChecklistsEdit,
  useChecklistsRemove,
} from '@/deals/cards/hooks/useChecklists';

import { ChecklistItemAdd } from './ChecklistItemAdd';
import { ChecklistItemContent } from './ChecklistItemContent';
import { CircularProgressBar } from '@/deals/components/common/CircularProgressbar';
import { IconTrash } from '@tabler/icons-react';
import {
  SortableList,
  SortableReorderMeta,
} from '@/deals/components/common/SortableList';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const ChecklistItem = ({
  item,
  stageId,
}: Readonly<{
  item: IChecklist;
  stageId?: string;
}>) => {
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState<IChecklistItem[]>(item.items ?? []);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [hideChecked, setHideChecked] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(item.title);
  const savingTitleRef = useRef(false);

  const { salesChecklistItemsAdd } = useChecklistItemsAdd();
  const { salesChecklistItemsReorder } = useChecklistItemsReorder();
  const { salesChecklistsEdit } = useChecklistsEdit();
  const { salesChecklistsRemove, salesChecklistsRemoveLoading, error } =
    useChecklistsRemove();
  const { confirm } = useConfirm();

  const checkedCount = items.filter((i) => i.isChecked).length;

  const { t } = useTranslation('sales');

  useEffect(() => {
    if (!Array.isArray(item.items)) return;

    setItems(item.items);
  }, [item]);

  useEffect(() => {
    setTitle(item.title);
  }, [item.title]);

  useEffect(() => {
    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  const handleAdd = async () => {
    const lines = newItem
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return;

    setNewItem('');
    setAdding(false);

    for (const [index, content] of lines.entries()) {
      try {
        const { data } = await salesChecklistItemsAdd({
          variables: {
            checklistId: item._id,
            content,
          },
        });

        if (data?.salesChecklistItemsAdd) {
          setItems((prev) => [...prev, data.salesChecklistItemsAdd]);
        }
      } catch (addError) {
        setNewItem(lines.slice(index).join('\n'));
        setAdding(true);
        toast({
          title: t('error'),
          description:
            addError instanceof Error ? addError.message : t('unknown-error'),
          variant: 'destructive',
        });
        return;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleAdd();
    }
  };

  const saveTitle = () => {
    if (savingTitleRef.current) return;

    const trimmed = title.trim();

    if (!trimmed || trimmed === item.title) {
      setTitle(item.title);
      setIsEditingTitle(false);
      return;
    }

    savingTitleRef.current = true;
    setIsEditingTitle(false);

    salesChecklistsEdit({
      variables: {
        _id: item._id,
        title: trimmed,
      },
      onCompleted: () => {
        savingTitleRef.current = false;
      },
      onError: (editError) => {
        savingTitleRef.current = false;
        setTitle(item.title);
        toast({
          title: t('error'),
          description: editError.message,
          variant: 'destructive',
        });
      },
    });
  };

  const cancelEditingTitle = () => {
    setTitle(item.title);
    setIsEditingTitle(false);
  };

  const onTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingTitle();
    }
  };

  const onReorderItems = (
    reOrderedVisibleItems: IChecklistItem[],
    { item: movedItem, newIndex }: SortableReorderMeta<IChecklistItem>,
  ) => {
    const precedingId =
      newIndex > 0 ? reOrderedVisibleItems[newIndex - 1]._id : null;

    const remainingItems = items.filter(
      (current) => current._id !== movedItem._id,
    );

    const destinationIndex = precedingId
      ? remainingItems.findIndex((current) => current._id === precedingId) + 1
      : 0;

    const previousItems = items;
    const nextItems = [...remainingItems];
    nextItems.splice(destinationIndex, 0, movedItem);

    setItems(nextItems);

    const movedPositions = nextItems
      .map((current, index) => ({ _id: current._id, order: index + 1 }))
      .filter(
        ({ _id, order }) =>
          previousItems.find((current) => current._id === _id)?.order !== order,
      );

    if (!movedPositions.length) return;

    Promise.all(
      movedPositions.map(({ _id, order }) =>
        salesChecklistItemsReorder({
          variables: {
            destinationIndex: order,
            _id,
          },
        }),
      ),
    ).catch((reorderError) => {
      setItems(previousItems);
      toast({
        title: t('error'),
        description:
          reorderError instanceof Error
            ? reorderError.message
            : t('unknown-error', 'Unknown error'),
        variant: 'destructive',
      });
    });
  };

  const onDeleteChecklist = (id: string) => {
    confirm({
      message: t('delete-checklist-confirm', { title: item.title }),
    }).then(() => {
      salesChecklistsRemove({
        variables: {
          _id: id,
        },
        onError: (removeError) => {
          if (
            removeError.message?.includes('permission') ||
            removeError.message?.includes('denied')
          ) {
            toast({
              title: t('permission-denied'),
              description: t('no-permission-delete-checklist'),
              variant: 'destructive',
            });
          }
        },
      });
    });
  };

  return (
    <Collapsible
      className="checklists mb-2 overflow-hidden rounded-md"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Collapsible.TriggerButton
            className="size-6 w-auto shrink-0 justify-center p-0"
            aria-label={item.title}
          >
            <Collapsible.TriggerIcon className="size-5 shrink-0" />
          </Collapsible.TriggerButton>
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={onTitleKeyDown}
              onBlur={saveTitle}
              className="h-7 flex-1"
              autoFocus
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto min-w-0 justify-start px-1 py-0.5 font-medium text-foreground"
              title={t('edit')}
              onClick={() => setIsEditingTitle(true)}
            >
              <span className="min-w-0 truncate">{item.title}</span>
            </Button>
          )}
          <CircularProgressBar
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
              onClick={() => setHideChecked(!hideChecked)}
            >
              {hideChecked
                ? t('show-checked-items', { count: checkedCount })
                : t('hide-completed-items')}
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={() => onDeleteChecklist(item._id)}
            title={t('delete-checklist')}
            size="sm"
            disabled={salesChecklistsRemoveLoading}
          >
            <IconTrash />{' '}
            {salesChecklistsRemoveLoading ? <Spinner /> : t('delete')}
          </Button>
        </div>
      </div>

      <Collapsible.Content
        className={cn(open && 'flex flex-col gap-1 py-1 pl-6')}
      >
        <SortableList
          items={hideChecked ? items.filter((i) => !i.isChecked) : items}
          onReorder={onReorderItems}
          dragHandleLabel={t('reorder', 'Reorder')}
          className="flex flex-col gap-1"
          renderItem={(
            checklistItem: IChecklistItem,
            _index: number,
            itemDragHandle: React.ReactNode,
          ) => (
            <ChecklistItemContent
              item={checklistItem}
              setItems={setItems}
              stageId={stageId}
              dragHandle={itemDragHandle}
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
