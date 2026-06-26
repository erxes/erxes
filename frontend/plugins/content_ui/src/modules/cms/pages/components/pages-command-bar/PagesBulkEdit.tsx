import { useState } from 'react';
import { Button, Command, Popover, RecordTable, toast } from 'erxes-ui';
import {
  IconChevronRight,
  IconCornerDownRight,
  IconProgressCheck,
  IconRepeat,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useBulkEditPages } from '../../hooks/useBulkEditPages';
import { usePages } from '../../hooks/usePages';
import { STATUS_DATA } from '@/cms/posts/constants/statusData';

export const PagesBulkEdit = ({ clientPortalId }: { clientPortalId: string }) => {
  const { t } = useTranslation('content');
  const [open, setOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState('main');

  const { table } = RecordTable.useRecordTable();
  const { bulkEditPages, loading } = useBulkEditPages();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r: any) => r.original._id as string);

  const { pages, loading: pagesLoading } = usePages({
    variables: { clientPortalId },
    skip: currentContent !== 'parent',
  });

  const eligiblePages = pages.filter((p: any) => !selectedIds.includes(p._id));

  const closePopover = () => {
    setOpen(false);
    setCurrentContent('main');
  };

  const handleEdit = async (input: Record<string, unknown>) => {
    try {
      await bulkEditPages(selectedIds, input);
      closePopover();
      toast({ title: t('success'), variant: 'default' });
    } catch (e: any) {
      toast({ title: t('error'), description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setTimeout(() => setCurrentContent('main'), 100);
        }
      }}
    >
      <Popover.Trigger asChild>
        <Button variant="secondary" size="sm" disabled={loading}>
          <IconRepeat className="size-4" />
          {t('actions')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="min-w-[280px] p-0" align="end" side="top" sideOffset={10}>
        {currentContent === 'main' && (
          <Command>
            <Command.Input />
            <Command.List className="p-0">
              <Command.Group className="p-1">
                <Command.Item
                  className="w-full justify-between"
                  onSelect={() => setCurrentContent('status')}
                >
                  <div className="flex gap-2 items-center">
                    <IconProgressCheck className="size-4" />
                    {t('status')}
                  </div>
                  <IconChevronRight />
                </Command.Item>
                <Command.Item
                  className="w-full justify-between"
                  onSelect={() => setCurrentContent('parent')}
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
                {STATUS_DATA.map((s) => (
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
            <Command.Input placeholder={t('search-pages')} />
            <Command.List>
              <Command.Group className="p-1">
                {pagesLoading && <Command.Item disabled>{t('loading')}</Command.Item>}
                {eligiblePages.map((page: any) => (
                  <Command.Item
                    key={page._id}
                    onSelect={() => handleEdit({ parentId: page._id })}
                  >
                    {page.name}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        )}
      </Popover.Content>
    </Popover>
  );
};
