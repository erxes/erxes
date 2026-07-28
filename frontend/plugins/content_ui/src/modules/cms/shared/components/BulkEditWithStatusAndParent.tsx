import { useRef, useState } from 'react';
import { Command, RecordTable, toast } from 'erxes-ui';
import {
  IconChevronRight,
  IconCornerDownRight,
  IconProgressCheck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  getErrorMessage,
  getRecordTableSelectedIds,
} from '@/cms/shared/utils';
import { BulkEditPopover } from './BulkEditPopover';

interface StatusItem {
  value: string;
}

interface ParentItem {
  _id: string;
  name: string;
}

interface BulkEditWithStatusAndParentProps {
  loading: boolean;
  statusItems: StatusItem[];
  parentItems: ParentItem[];
  parentLoading: boolean;
  parentSearchPlaceholder: string;
  onBulkEdit: (ids: string[], input: Record<string, unknown>) => Promise<void>;
  onContentChange?: (content: string) => void;
}

export const BulkEditWithStatusAndParent = ({
  loading,
  statusItems,
  parentItems,
  parentLoading,
  parentSearchPlaceholder,
  onBulkEdit,
  onContentChange,
}: BulkEditWithStatusAndParentProps) => {
  const { t } = useTranslation('content');
  const [open, setOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState('main');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { table } = RecordTable.useRecordTable();
  const selectedIds = getRecordTableSelectedIds(
    table.getFilteredSelectedRowModel().rows,
  );
  const availableParentItems = parentItems.filter(
    (item) => !selectedIds.includes(item._id),
  );

  const changeContent = (content: string) => {
    setCurrentContent(content);
    onContentChange?.(content);
  };

  const closePopover = () => {
    setOpen(false);
    changeContent('main');
  };

  const handleEdit = async (input: Record<string, unknown>) => {
    try {
      await onBulkEdit(selectedIds, input);
      closePopover();
      toast({ title: t('success'), variant: 'default' });
    } catch (error) {
      toast({
        title: t('error'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <BulkEditPopover
      open={open}
      loading={loading}
      onOpenChange={(v) => {
        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
          resetTimerRef.current = null;
        }

        setOpen(v);
        if (!v) {
          resetTimerRef.current = setTimeout(() => {
            changeContent('main');
            resetTimerRef.current = null;
          }, 100);
        }
      }}
    >
      {currentContent === 'main' && (
        <Command>
          <Command.Input />
          <Command.List className="p-0">
            <Command.Group className="p-1">
              <Command.Item
                className="w-full justify-between"
                onSelect={() => changeContent('status')}
              >
                <div className="flex gap-2 items-center">
                  <IconProgressCheck className="size-4" />
                  {t('status')}
                </div>
                <IconChevronRight />
              </Command.Item>
              <Command.Item
                className="w-full justify-between"
                onSelect={() => changeContent('parent')}
              >
                <div className="flex gap-2 items-center">
                  <IconCornerDownRight className="size-4" />
                  {t('parent')}
                </div>
                <IconChevronRight />
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      )}

      {currentContent === 'status' && (
        <Command>
          <Command.List>
            <Command.Group className="p-1">
              {statusItems.map((s) => (
                <Command.Item key={s.value} onSelect={() => handleEdit({ status: s.value })}>
                  {t(s.value)}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      )}

      {currentContent === 'parent' && (
        <Command>
          <Command.Input placeholder={parentSearchPlaceholder} />
          <Command.List>
            <Command.Group className="p-1">
              <Command.Item onSelect={() => handleEdit({ parentId: null })}>
                {t('remove-parent')}
              </Command.Item>
            </Command.Group>
            <Command.Separator />
            <Command.Group className="p-1">
              {parentLoading && <Command.Item disabled>{t('loading')}</Command.Item>}
              {availableParentItems.map((item) => (
                <Command.Item key={item._id} onSelect={() => handleEdit({ parentId: item._id })}>
                  {item.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      )}
    </BulkEditPopover>
  );
};
