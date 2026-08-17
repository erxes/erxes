import {
  Button,
  Checkbox,
  DropdownMenu,
  Textarea,
  cn,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconDotsVertical, IconRefresh, IconTrash } from '@tabler/icons-react';
import {
  useChecklistItemsEdit,
  useChecklistItemsRemove,
} from '@/deals/cards/hooks/useChecklists';
import { useEffect, useRef, useState } from 'react';

import { GET_STAGE_DETAIL } from '~/modules/deals/graphql/queries/StagesQueries';
import { IChecklistItem } from '@/deals/types/checklists';
import { useDealsAdd } from '@/deals/cards/hooks/useDeals';
import { useTranslation } from 'react-i18next';

export const ChecklistItemContent = ({
  item,
  setItems,
  stageId,
  dragHandle,
}: Readonly<{
  item: IChecklistItem;
  setItems: React.Dispatch<React.SetStateAction<IChecklistItem[]>>;
  stageId?: string;
  dragHandle?: React.ReactNode;
}>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(item.content);
  const savingContentRef = useRef(false);
  const { confirm } = useConfirm();
  const { t } = useTranslation('sales');
  const { salesChecklistItemsEdit } = useChecklistItemsEdit();
  const { salesChecklistItemsRemove } = useChecklistItemsRemove({
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message || t('failed-to-remove-item'),
        variant: 'destructive',
      });
    },
  });

  const { addDeals } = useDealsAdd();

  useEffect(() => {
    setContent(item.content);
  }, [item.content]);

  const removeItem = (id: string) => {
    salesChecklistItemsRemove({
      variables: { _id: id },
      onCompleted: () => {
        setItems((prev) => prev.filter((current) => current._id !== id));
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleRemove = (id: string) => {
    confirm({
      message: t('are-you-sure'),
    }).then(() => removeItem(id));
  };

  const onChangeChecked = () => {
    const isChecked = !item.isChecked;

    setItems((prev) =>
      prev.map((current) =>
        current._id === item._id ? { ...current, isChecked } : current,
      ),
    );

    salesChecklistItemsEdit({
      variables: {
        _id: item._id,
        isChecked,
      },
      onError: (error) => {
        setItems((prev) =>
          prev.map((current) =>
            current._id === item._id
              ? { ...current, isChecked: !isChecked }
              : current,
          ),
        );
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const saveContent = () => {
    if (savingContentRef.current) return;

    const trimmed = content.trim();

    if (!trimmed || trimmed === item.content) {
      setContent(item.content);
      setIsEditing(false);
      return;
    }

    savingContentRef.current = true;
    setIsEditing(false);
    setItems((prev) =>
      prev.map((current) =>
        current._id === item._id ? { ...current, content: trimmed } : current,
      ),
    );

    salesChecklistItemsEdit({
      variables: {
        _id: item._id,
        content: trimmed,
      },
      onCompleted: () => {
        savingContentRef.current = false;
      },
      onError: (error) => {
        savingContentRef.current = false;
        setContent(item.content);
        setItems((prev) =>
          prev.map((current) =>
            current._id === item._id
              ? { ...current, content: item.content }
              : current,
          ),
        );
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const cancelEditing = () => {
    setContent(item.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveContent();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  const onConvert = () => {
    addDeals({
      variables: {
        name: item.content,
        stageId,
      },
      refetchQueries: stageId
        ? [
            {
              query: GET_STAGE_DETAIL,
              variables: {
                _id: stageId,
              },
            },
          ]
        : [],
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('checklist-item-converted'),
        });
        removeItem(item._id);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message || t('failed-to-convert-to-deal'),
          variant: 'destructive',
        });
      },
    });
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="min-h-0 resize-none px-2 py-1.5 text-xs"
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={saveContent}>
            {t('save')}
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEditing}>
            {t('cancel')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-1 gap-2 relative rounded hover:bg-accent-foreground/10 transition-colors">
      <div className="flex items-center gap-2 text-xs">
        {dragHandle}
        <Checkbox
          checked={item.isChecked || false}
          onCheckedChange={onChangeChecked}
        />
        <button
          type="button"
          title={t('edit')}
          className={cn(
            'text-xs text-left select-none',
            item.isChecked && 'line-through text-muted-foreground',
          )}
          onClick={() => setIsEditing(true)}
        >
          {item.content}
        </button>
      </div>

      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label={t('more-actions')}
          >
            <IconDotsVertical />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="w-44 min-w-fit!">
          <DropdownMenu.Item onClick={onConvert} disabled={!stageId}>
            <IconRefresh />
            {t('convert-to-deal')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => handleRemove(item._id)}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="text-destructive" />
            {t('delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};
